import { ISessionRepository } from "@/interfaces/ISessionRepository";
import { SessionModel } from "../models/sessionModel";
import { Session } from "@/types/types";
import { DeleteResult, } from "mongoose";
import { hashData } from "../helpers";

export class SessionRepository implements ISessionRepository {

  async countByUserId(userId: string,): Promise<number> {
    return await SessionModel.countDocuments({ userId });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return await SessionModel.find({ userId });
  }

  async findByJti(tokenJTi: string): Promise<Session | null> {
    const JTI = hashData(tokenJTi);
    return await SessionModel.findOne({ JTI });
  }

  async create(sessionData: Session,): Promise<Session | null> {
    const sessionDataWithHashedJTI: Session = { ...sessionData, JTI: hashData(sessionData.JTI) };
    const docs = await SessionModel.create([sessionDataWithHashedJTI]);
    return docs[0];
  }

  async removeByUserId(userId: string): Promise<DeleteResult> {
    return await SessionModel.deleteMany({ userId });
  }

  async removeByJti(jti: string): Promise<DeleteResult> {
    return await SessionModel.deleteOne({ JTI: hashData(jti) });
  }
  async removeByDeviceId(deviceId: string): Promise<DeleteResult> {
    return await SessionModel.deleteOne({ deviceId });
  }

  async removeOldest(userId: string,): Promise<DeleteResult> {
    return await SessionModel.deleteOne({ userId }).sort({ createdAt: 1 });
  }

  async removeManyOldest(userId: string, count: number): Promise<DeleteResult | null> {
    const toDelete = await SessionModel.find({ userId })
      .sort({ createdAt: 1 })
      .limit(count)
      .select('_id');
    if (toDelete.length === 0) return null;

    const ids = toDelete.map(doc => doc.id);
    return await SessionModel.deleteMany({ _id: { $in: ids } });
  }

}