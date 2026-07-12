import { Session } from "@/types/types";
import mongoose, { model } from "mongoose";

const sessionSchema = new mongoose.Schema<Session>({

  userId:
  {
    type: String,
    required: true,
    index: true,

  },
  JTI: {
    type: String,
    required: true,
    unique: true,
  },
  deviceInfo: {
    type: String,
    required: true,
  }
}, { timestamps: true }
);
sessionSchema.index({ userId: 1, createdAt: 1 });
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 });

export const SessionModel = model<Session>('Session', sessionSchema);