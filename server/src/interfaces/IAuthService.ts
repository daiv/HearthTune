import { AuthPayload, IsTokenLegitResponse, Role, User } from "@/types/types";

export interface IAuthService {
  checkUserPassword: (userId: string, plainPassword: string) => Promise<boolean>;
  login: (email: string, password: string, deviceInfo?: string) => Promise<AuthPayload>;
  createTokenPair: (userId: string, jti: string, role: Role) => AuthPayload;
  refreshTokens: (jti: string) => Promise<AuthPayload>;
}