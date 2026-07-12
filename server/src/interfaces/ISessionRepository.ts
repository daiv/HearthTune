import { Session } from "@/types/types";
import { DeleteResult } from "mongoose";

export interface ISessionRepository {
  countByUserId: (userId: string) => Promise<number>;
  findByUserId: (userId: string) => Promise<Session[]>;
  findByJti: (jti: string) => Promise<Session | null>;
  create: (session: Session) => Promise<Session | null>;
  removeByUserId: (userId: string) => Promise<DeleteResult>;
  removeByJti: (token: string) => Promise<DeleteResult>;
  removeOldest: (userId: string) => Promise<DeleteResult>;
  removeManyOldest: (userId: string, count: number) => Promise<DeleteResult | null>;
}