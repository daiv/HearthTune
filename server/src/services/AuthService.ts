import { IAuthService } from "@/interfaces/IAuthService";
import { AccessPayload, Role, Session } from "@/types/types";
import { UserRepository } from "@/repositories";
import { AccountNotActiveException, InvalidCredentialsException, InvalidTokenException, MissingUserRoleException, ServerError, TrialExpiredException, } from "@/errors/ServerError";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isTrialExpired } from "@/helpers";
import { SessionService } from "./SessionService";
import { AuthPayload } from "@/common/types";

export class AuthService implements IAuthService {

  constructor(private userRepository: UserRepository, private sessionService: SessionService) { }

  async checkUserPassword(userId: string, plainPassword: string): Promise<boolean> {
    const password = await this.userRepository.getUserPassword(userId);
    if (!password) return false;
    return await bcrypt.compare(plainPassword, password)
  }

  async login(email: string, password: string, deviceInfo: string = 'Unknown device'): Promise<AuthPayload> {

    const user = await this.userRepository.getUserByEmail(email);
    if (!user
      || !user.id
      || (!await this.checkUserPassword(user.id, password))
    ) throw new InvalidCredentialsException();

    if (!user.role) throw new MissingUserRoleException();

    if (user.status !== "active") throw new AccountNotActiveException();

    const session = await this.createSession(user.id, user.role, deviceInfo);
    if (!session) throw new ServerError();

    return this.createTokenPair(session.userId, session.JTI, user.role);
  }

  async createSession(id: string, role: Role, deviceInfo?: string): Promise<Session> {
    const jti = crypto.randomUUID();
    const session = await this.sessionService.add(id, jti, role, deviceInfo);
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


    const { userId, deviceInfo } = currentSession;
    const newSession = await this.createSession(userId, user.role, deviceInfo);
    if (!newSession) throw new ServerError();

    return this.createTokenPair(newSession.userId, newSession.JTI, newSession.role);
  }
}