import mongoose, { model } from "mongoose";

type LikeSong = {
  userId: string
  songId: string;
  createdAt: Date
}
const likeSongSchema = new mongoose.Schema<LikeSong>({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  songId: {
    type: String,
    ref: 'Song',
    required: true
  },

}, { timestamps: true });

likeSongSchema.index({ userId: 1, songId: 1 }, { unique: true });
export const LikeModel = model<LikeSong>('Liked', likeSongSchema);