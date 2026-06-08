import { CreateUserDto, Role, User } from "@/types/types";

export interface IUserService {
  createUser: (data: CreateUserDto) => Promise<User>;
  saveUser: (user: User) => Promise<User>;
  createUsersFromEnv: () => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User>;
  getUserByToken: (token: string) => Promise<User | null>;

}