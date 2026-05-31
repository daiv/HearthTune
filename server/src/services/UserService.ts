import { expiresIn, hashEmail, sendEmail } from "../helpers";
import { IUserService } from "@/interfaces/IUserService";
import { UserRepository } from "@/repositories/UserRepository";
import { CreateUserDto, Role, User, UserCredentials } from "@/types/types";
import bcrypt from 'bcrypt';

export class UserService implements IUserService {

  constructor(private userRepository: UserRepository) { }

  async createUser(data: CreateUserDto): Promise<User> {
    const { password, email, nick, role = 'basic' } = data;
    const encryptedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    const emailHash = hashEmail(email);

    const user: User & { emailHash: string } = {
      email,
      emailHash,
      nick,
      password: encryptedPassword,
      status: "whiteListed",
      role,
      id: crypto.randomUUID()
    }
    return await this.userRepository.save(user);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getUserByEmailHash(hashEmail(email));
    if (!user) throw new Error('User not found');
    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.getUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUsersFromEnv() {
    const envEntries = process.env.USERS?.split(';') || [];
    if (envEntries.length % 2 !== 0) throw new Error('bad env.users format');

    console.log('entries', envEntries);
    const envUsers = [];

    for (let i = 0; i < envEntries.length; i += 2) {
      const email = envEntries[i];
      const role: Role = envEntries[i + 1] as Role;

      const user: CreateUserDto = {
        email,
        role,
      };
      envUsers.push(user);
    }
    const dbUsers = await this.userRepository.getAllUsers() || [];
    await Promise.all(
      envUsers.filter(user => !dbUsers
        .find(dbUser => dbUser.email === user.email))
        .map(newUser => this.createUser(newUser)
        ));
    const finalDbUsers = await this.userRepository.getAllUsers() || [];
    console.log('finalUsers', finalDbUsers);
  }


  async sendActivationLink(to: string, token: string): Promise<boolean> {
    const mailSuccess = await sendEmail(to, token);
    return mailSuccess.rejected.length === 0;
  }

  async sendActivationLinks() {
    type UserResponse = User & { activated: boolean };
    const usersToEmail: UserResponse[] = (await this.userRepository.getWhiteListedUsers())?.map(user => {
      const credentials: UserCredentials = {
        expiration: expiresIn(12),
        token: crypto.randomUUID()
      };
      return { ...user, credentials, activated: false };
    }) || [];

    const usersSuccessfullyMailed = (await Promise.allSettled(usersToEmail
      .map(async (user) => {
        const { email, credentials } = user;
        const activated = await this.sendActivationLink(email, credentials!.token);
        return { ...user, activated };
      })
    ))
      .filter((res): res is PromiseFulfilledResult<UserResponse> => res.status === 'fulfilled')
      .map(userResponse => {
        const { activated, ...plainUser } = userResponse.value;
        return plainUser;
      });

    await Promise.all(usersSuccessfullyMailed.map(async (user) => {
      const updatedUser: User = { ...user, status: "email sent" }
      return this.userRepository.save(updatedUser);
    }));
  }
}