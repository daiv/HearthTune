import { User, UserStatus } from "@/types/types";

export interface IUserRepository {

  save(user: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  // getUserByEmailHash(emailHash: string): Promise<User | null>;
  getUserByStatus(status: UserStatus): Promise<User[] | null>;
  getAllUsers(): Promise<User[] | null>;
  setUserStatus(userId: string, status: UserStatus): Promise<User | null>;
  getUserPassword(userId: string): Promise<string | null>;
}