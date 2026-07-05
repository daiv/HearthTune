import { ISessionRepository } from "@/interfaces/ISessionRepository";
import { SessionModel } from "../models/sessionModel";
import { Session } from "@/types/types";
import mongoose, { DeleteResult, } from "mongoose";

export class SessionRepository implements ISessionRepository {

  async countByUserId(userId: string,): Promise<number> {
    return await SessionModel.countDocuments({ userId });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return await SessionModel.find({ userId });
  }

  async findByTokenHash(tokenJTIHash: string): Promise<Session | null> {
    return await SessionModel.findOne({ tokenJTIHash });
  }

  async create(sessionData: Session,): Promise<Session | null> {
    const docs = await SessionModel.create([sessionData]);
    return docs[0];
  }

  async removeByUserId(userId: string): Promise<DeleteResult> {
    return await SessionModel.deleteMany({ userId });
  }

  async removeByTokenHash(tokenJTIHash: string): Promise<DeleteResult> {
    return await SessionModel.deleteOne({ tokenJTIHash });
  }

  async removeOldest(userId: string,): Promise<DeleteResult> {
    return await SessionModel.deleteOne({ userId }).sort({ createdAt: 1 });
  }
}