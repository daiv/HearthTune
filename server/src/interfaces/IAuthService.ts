import { IsTokenLegitResponse, User } from "@/types/types";

export interface IAuthService {
  sendActivationLink: (to: string, token: string) => Promise<boolean>;
  prepareUserCredentials(user: User): User & { emailSent: boolean };
  sendActivationLinkToWhiteListedUsers: () => Promise<void>;
  sendActivationLinkTo: (usersToEmail: User[]) => Promise<void>;
  isValidationTokenLegit: (token: string) => Promise<IsTokenLegitResponse>;
  getUserByToken: (token: string) => Promise<User | null>;
  removeCredentials: (userId: string) => Promise<boolean>;
  setUserPassword: (userId: string, plainPassword: string) => Promise<User | null>;
  checkUserPassword: (userId: string, plainPassword: string) => Promise<boolean>;
  enableUserAccount: (userId: string) => Promise<boolean>;
  requestNewLinkToAdmin: (token: string) => Promise<boolean>;
  updateStateByExpiredToken: (token: string) => Promise<boolean>;
}