import { User } from "@/types/types";

export interface IUserService {
  // changePassword: (id: string, newPassword: string) => Promise<boolean>;
  // changeNick: (id: string, newNick: string) => Promise<boolean>;
  createUser: (nick: string, email: string, password: string) => Promise<User>;
}