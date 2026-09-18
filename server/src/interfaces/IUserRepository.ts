import { Credential, ResetPasswordCredential, User, UserCredential, UserStatus } from "@/types/types";

export interface IUserRepository {

  save(user: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  // getUserByEmailHash(emailHash: string): Promise<User | null>;
  getUserByStatus(status: UserStatus): Promise<User[] | null>;
  getCredentialsFromValidationToken(token: string): Promise<UserCredential | null>;
  getCredentialsFromId(userId: string): Promise<UserCredential | null>;
  removeCredentials(id: string): Promise<boolean>;

  saveResetPasswordCredentials(userId: string, resetPasswordCredential: Credential): Promise<boolean>;
  getResetPasswordCredentials(token: string): Promise<ResetPasswordCredential | null>;
  removeResetPasswordCredentials(userId: string): Promise<boolean>;
  getMinutesSinceLastResetPassword(userId: string): Promise<number | null>;
  getUserIdByResetPasswordToken(token: string): Promise<string | null>;

  getAllUsers(): Promise<User[] | null>;
  setUserStatus(userId: string, status: UserStatus): Promise<User | null>;
  getUserPassword(userId: string): Promise<string | null>;
}