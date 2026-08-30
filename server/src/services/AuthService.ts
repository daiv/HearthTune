import { IAuthService } from "@/interfaces/IAuthService";
import { AccessPayload, Role, Session, SignedUrlValidationParams } from "@/types/types";
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
    console.warn('jti sent by client', jti);
    const currentSession = await this.sessionService.getSessionByJti(jti);
    if (!currentSession) throw new InvalidTokenException();

    const user = await this.userRepository.getUserById(currentSession.userId);
    if (!user || user.status === 'banned') throw new InvalidTokenException();

    if (!user.activatedAt) throw new ServerError();

    if (user.role === 'basic' && isTrialExpired(user.activatedAt)) throw new TrialExpiredException();

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
    console.log('valid = ', expectedSignature === sign);
    return expectedSignature === sign;
  }

  createSignedAndroidAppDownloadUrl(userId: string, expiration?: number): SignedUrl {
    const expiresAt = expiration || expiresIn(30, "minutes").getTime();
    const jti = randomUUID();
    const dataToSign = `${userId}:${jti}:${expiresAt}`;
    const signature = hashData(dataToSign);
    const baseUrl = process.env.SERVER_URL;

    const signedUrl = `${baseUrl}/app-download?userId=${userId}&jti=${jti}&expiresAt=${expiresAt}&sign=${signature}`;
    return { signedUrl }
  }

  isDownloadUrlValid(userId: string, jti: string, expiresAt: string, sign: string): boolean {
    const numericExpiresAt = Number(expiresAt);
    if (isNaN(numericExpiresAt)) throw new BadRequestException();
    if (Date.now() > numericExpiresAt) return false;

    const dataToSign = `${userId}:${jti}:${expiresAt}`;
    const expectedSignature = hashData(dataToSign);
    return expectedSignature === sign;
  }
}
