import { hashEmail } from "../helpers";
import { IUserService } from "@/interfaces/IUserService";
import { UserRepository } from "@/repositories/UserRepository";
import { User } from "@/types/types";
import bcrypt from 'bcrypt';

export class UserService implements IUserService {

  constructor(private userRepository: UserRepository) { }

  async createUser(nick: string, email: string, password: string): Promise<User> {
    if ((await this.userRepository.getUserByEmailHash(hashEmail(email)))) throw new Error('user Already exists');

    const encryptedPassword = await bcrypt.hash(password, 12);
    const user: User = {
      email, 
      nick,
      password: encryptedPassword,
      status: "whiteListed",
      id: crypto.randomUUID()
    }
    return await this.userRepository.save(user);
  }




}