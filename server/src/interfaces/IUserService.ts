import { CreateUserDto, Role, User } from "@/types/types";

export interface IUserService {
  // changePassword: (id: string, newPassword: string) => Promise<boolean>;
  // changeNick: (id: string, newNick: string) => Promise<boolean>;
  // async createUser(email: string, password: string, role: Role, nick?: string): Promise<User>
  createUser: (data: CreateUserDto) => Promise<User>;
  getUserById: (id: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User>;
  createUsersFromEnv: () => Promise<void>;
  sendActivationLinks: () => Promise<void>;
}