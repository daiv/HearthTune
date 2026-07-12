import { CreateUserDto, Role, User, Credential, UserCredential } from "@/types/types";

export interface IUserService {
  createUser: (data: CreateUserDto) => Promise<User>;
  saveUser: (user: User) => Promise<User>;
  createUsersFromEnv: () => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User>;
  setUserPassword: (userId: string, plainPassword: string) => Promise<User | null>;
}