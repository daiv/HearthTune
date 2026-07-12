import { UserNotFoundException } from "../errors/ServerError";
import { hashData } from "../helpers";
import { IUserService } from "@/interfaces/IUserService";
import { UserRepository } from "@/repositories/UserRepository";
import { CreateUserDto, Role, User } from "@/types/types";
import bcrypt from 'bcrypt';

export class UserService implements IUserService {

  constructor(private userRepository: UserRepository) { }

  async createUser(data: CreateUserDto): Promise<User> {
    if (!data.email) throw new Error('bad user format');
    const { password, email, nick, role = 'basic' } = data;
    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    const emailHash = hashData(email);

    const user: User & { emailHash: string } = {
      email,
      emailHash,
      nick,
      password: hashedPassword,
      status: "whiteListed",
      role,
      id: crypto.randomUUID()
    }
    return await this.userRepository.save(user);
  }
  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
  async setUserPassword(userId: string, plainPassword: string): Promise<User | null> {
    const password = await bcrypt.hash(plainPassword, 12);
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new UserNotFoundException();
    user.password = password;
    const savedUser = await this.userRepository.save(user);
    return savedUser;
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
        .map(newUser => this
          .createUser(newUser)
        ));
  }

  async getUserById(id: string) {
    const user = await this.userRepository.getUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new Error('User not found');
    return user;
  }

  async getWhiteListedUsers(): Promise<User[] | null> {
    const whiteListedUsers = await this.userRepository.getUserByStatus('whiteListed');
    return whiteListedUsers;
  }
}