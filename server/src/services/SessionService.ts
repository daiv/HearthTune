import { getMaxSessionsAllowed, hashData } from "../helpers";
import { ISessionService } from "@/interfaces/ISessionService";
import { SessionRepository } from "../repositories/SessionRepository";
import { Role, Session } from "@/types/types";
import { DeleteResult } from "mongoose";

export class SessionService implements ISessionService {
  constructor(private sessions: SessionRepository) { }

  async add(userId: string, jti: string, role: Role, deviceInfo: string = 'Unknown device'): Promise<Session | null> {
    let currentSessions = await this.sessions.countByUserId(userId);
    const maxSessionsAllowed = getMaxSessionsAllowed(role);
    const toDeleteCount = (currentSessions - maxSessionsAllowed) + 1;

    if (toDeleteCount > 0) await this.sessions.removeManyOldest(userId, toDeleteCount);
    const newSession: Session = {
      deviceInfo,
      JTI: jti,
      userId,
      role
    }
    const sessionCreated = await this.sessions.create(newSession);

    return sessionCreated ? newSession : null;
  }

  async remove(jti: string): Promise<DeleteResult> {
    return await this.sessions.removeByJti(jti);
  }

  async removeAll(userId: string): Promise<DeleteResult> {
    return await this.sessions.removeByUserId(userId);
  }
  async getSessionByJti(jti: string): Promise<Session | null> {
    return await this.sessions.findByJti(jti);
  }
  async countSessions(userId: string): Promise<number> {
    return this.sessions.countByUserId(userId);
  }
}