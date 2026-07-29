import { AuthPayload } from "@/common/types";
import { Role, } from "@/types/types";

export interface IAuthService {
  checkUserPassword: (userId: string, plainPassword: string) => Promise<boolean>;
  login: (email: string, password: string, deviceId: string, deviceInfo?: string) => Promise<AuthPayload>;
  logout: (jti: string) => Promise<boolean>;
  createTokenPair: (userId: string, jti: string, role: Role) => AuthPayload;
  refreshTokens: (jti: string) => Promise<AuthPayload>;
}