import { Role, Session } from "@/types/types";
import { DeleteResult } from "mongoose";

export interface ISessionService {
  add: (userId: string, jti: string, role: Role, deviceId: string, deviceInfo?: string) => Promise<Session | null>;
  remove: (jti: string) => Promise<DeleteResult>;
  removeAll: (userId: string) => Promise<DeleteResult>;
  getSessionByJti: (jti: string) => Promise<Session | null>;
  countSessions: (userId: string) => Promise<number>;
}