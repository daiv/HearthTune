import { Session } from "@/types/types";
import { DeleteResult } from "mongoose";

export interface ISessionRepository {
  create: (session: Session) => Promise<Session | null>;
  findByTokenHash: (tokenHash: string) => Promise<Session | null>;
  findByUserId: (userId: string) => Promise<Session[]>;
  countByUserId: (userId: string) => Promise<number>;
  removeByTokenHash: (tokenHash: string) => Promise<DeleteResult>;
  removeByUserId: (userId: string) => Promise<DeleteResult>;
}