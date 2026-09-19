import { IAuthService } from "@/interfaces/IAuthService";
import { AccessPayload, Role, Session, Credential, ResetPasswordCredential, } from "@/types/types";
import { UserRepository } from "@/repositories";
import { AccountNotActiveException, BadRequestException, InvalidCredentialsException, InvalidTokenException, MissingUserRoleException, ServerError, TrialExpiredException, } from "@/errors/ServerError";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { expiresIn, hashData, isTrialExpired } from "@/helpers";
import { SessionService } from "./SessionService";
import { AuthPayload, SignedUrl } from "@/common/types";
import { randomUUID } from "node:crypto";
export class AuthService implements IAuthService {

  constructor(private userRepository: UserRepository, private sessionService: SessionService) { }

  async checkEmailPassword(email: string, password: string): Promise<boolean> {

    const userId = await this.userRepository.getUserByEmail(email);
    if (!userId) return false;

    return await this.checkUserPassword(userId.id, password);
  }

  async checkUserPassword(userId: string, plainPassword: string): Promise<boolean> {
    const password = await this.userRepository.getUserPassword(userId);
    if (!password) return false;
    return await bcrypt.compare(plainPassword, password)
  }
  async encryptPassword(plainPassword: string): Promise<string> {
    const password = await bcrypt.hash(plainPassword, 12);
    return password;

  }
  async login(email: string, password: string, deviceId: string, deviceInfo: string = 'Unknown device'): Promise<AuthPayload> {

    const user = await this.userRepository.getUserByEmail(email);
    if (!user
      || !user.id
      || (!await this.checkUserPassword(user.id, password))
    ) throw new InvalidCredentialsException();

    if (!user.role) throw new MissingUserRoleException();

    if (user.status !== "active") throw new AccountNotActiveException();

    const session = await this.createSession(user.id, user.role, deviceId, deviceInfo);
    if (!session) throw new ServerError();

    return this.createTokenPair(session.userId, session.JTI, user.role);
  }
  async logout(jti: string): Promise<boolean> {
    const result = await this.sessionService.remove(jti);
    return result.deletedCount > 0;
  }
  async createSession(id: string, role: Role, deviceId: string, deviceInfo?: string): Promise<Session> {
    const jti = crypto.randomUUID();
    const session = await this.sessionService.add(id, jti, role, deviceId, deviceInfo);
    if (!session) throw new ServerError();
    return session;
  }

  createTokenPair(userId: string, refreshJti: string, role: Role): AuthPayload {

    const accessPayload: AccessPayload = {
      userId,
      role,
      jti: crypto.randomUUID()
    }
    const key = process.env.ACCESS_TOKEN_KEY;
    if (!key) throw new ServerError();

    const accessToken = jwt.sign(
      accessPayload,
      key,
      { expiresIn: '5m' }
    );

    const refreshToken = refreshJti;

    return { accessToken, refreshToken };
  }
  isAccessTokenValid(token: string): AccessPayload | null {
    if (!token) return null;
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY!) as AccessPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }
  async refreshTokens(jti: string): Promise<AuthPayload> {
    const currentSession = await this.sessionService.getSessionByJti(jti);
    if (!currentSession) throw new InvalidTokenException();

    const user = await this.userRepository.getUserById(currentSession.userId);
    if (!user || user.status === 'banned') throw new InvalidTokenException();

    if (!user.activatedAt) throw new ServerError();

    if (user.role === 'recruiter' && isTrialExpired(user.activatedAt)) throw new TrialExpiredException();

    const removeResult = await this.sessionService.remove(jti);
    if (removeResult.deletedCount === 0) throw new InvalidTokenException();

    const { userId, deviceInfo, deviceId } = currentSession;
    const newSession = await this.createSession(userId, user.role, deviceId, deviceInfo);
    if (!newSession) throw new ServerError();

    return this.createTokenPair(newSession.userId, newSession.JTI, newSession.role);
  }

  createSignedUrl(songId: string, provider: string, userId: string, expiration?: number): SignedUrl {

    const expiresAt = expiration || expiresIn(30, "minutes").getTime();
    const dataToSign = `${songId}:${provider}:${userId}:${expiresAt}`;
    const signature = hashData(dataToSign);
    const baseUrl = process.env.SERVER_URL;

    const signedUrl = `${baseUrl}/song/play?songId=${songId}&provider=${provider
      }&userId=${userId}&expiresAt=${expiresAt}&sign=${signature}`;

    return { signedUrl };
  }

  isSignedUrlValid(songId: string, provider: string, userId: string, expiresAt: string, sign: string): boolean {
    const numericExpiresAt = Number(expiresAt);
    if (isNaN(numericExpiresAt)) throw new BadRequestException();
    if (Date.now() > numericExpiresAt) return false;

    const dataToSign = `${songId}:${provider}:${userId}:${expiresAt}`;
    const expectedSignature = hashData(dataToSign);
    return expectedSignature === sign;
  }
  async generateResetPasswordUrl(email: string): Promise<string | null> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user
      || user.status !== 'active'
    ) return null;
    const minsElapsed = await this.userRepository.getMinutesSinceLastResetPassword(user.id);
    if (minsElapsed === null
      || minsElapsed < 30
    ) return null;
    const token = randomUUID();
    const resetPasswordCredential: Credential = {
      token,
      expiresAt: expiresIn(30, 'minutes'),
    };
    const success = await this.userRepository.saveResetPasswordCredentials(user.id, resetPasswordCredential);
    const url = `${process.env.SERVER_URL}/set-new-password/${token}`;
    return url;

  }

  async isResetPasswordTokenValid(token: string): Promise<boolean> {
    const credential: ResetPasswordCredential | null = await this.userRepository.getResetPasswordCredentials(token);
    if (!credential || !credential.active) return false;

    const { token: storedHash, expiresAt } = credential;
    const numericStoredExpires = Number(expiresAt);
    if (isNaN(numericStoredExpires) ||
      Date.now() >= numericStoredExpires) {
      return false;
    }

    return storedHash === hashData(token);
  }
  async invalidateResetPasswordToken(userId: string): Promise<boolean> {
    const user = await this.userRepository.getUserById(userId);
    if (!user || !user.resetPassword) return false;
    user.resetPassword.active = false;
    await this.userRepository.save(user);
    return true;
  };
  createDownloadUrl(userId: string): string {
    const expiresAt = expiresIn(30, "minutes").getTime();

    const jti = randomUUID();
    const dataToSign = `${userId}:${jti}:${expiresAt}`;
    const signature = hashData(dataToSign);
    const baseUrl = process.env.SERVER_URL;
    const signedUrl = `${baseUrl}/apk-download-signed?userId=${userId}&jti=${jti}&expiresAt=${expiresAt}&sign=${signature}`;
    return signedUrl;
  };
  isDownloadUrlValid(userId: string, jti: string, expiresAt: string, sign: string): boolean {
    const numericExpiresAt = Number(expiresAt);
    if (isNaN(numericExpiresAt)) throw new BadRequestException();
    if (Date.now() > numericExpiresAt) return false;

    const dataToSign = `${userId}:${jti}:${expiresAt}`;
    const expectedSignature = hashData(dataToSign);
    return expectedSignature === sign;
  };
}
