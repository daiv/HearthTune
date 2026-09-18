import { AuthPayload, SignedUrl } from "@/common/types";
import { AccessPayload, Role, Session, SignedUrlValidationParams, SsrLoginResponse, } from "@/types/types";

export interface IAuthService {
  checkUserPassword: (userId: string, plainPassword: string) => Promise<boolean>;
  checkEmailPassword: (email: string, plainPassword: string) => Promise<boolean>;
  login: (email: string, password: string, deviceId: string, deviceInfo?: string) => Promise<AuthPayload>;
  logout: (jti: string) => Promise<boolean>;
  createSession: (id: string, role: Role, deviceId: string, deviceInfo?: string) => Promise<Session>;
  createTokenPair: (userId: string, jti: string, role: Role) => AuthPayload;
  isAccessTokenValid: (token: string) => AccessPayload | null;
  refreshTokens: (jti: string) => Promise<AuthPayload>;
  createSignedUrl: (songId: string, provider: string, userId: string, expiration?: number) => SignedUrl;
  isSignedUrlValid: (songId: string, provider: string, userId: string, expiresAt: string, sign: string,) => boolean;
  generateResetPasswordUrl: (email: string) => Promise<string | null>;
  isResetPasswordTokenValid: (token: string) => Promise<boolean>;
  invalidateResetPasswordToken: (token: string) => Promise<boolean>;

  createDownloadUrl: (userId: string) => string;
  isDownloadUrlValid: (userId: string, jti: string, expiresAt: string, sign: string) => boolean;
}