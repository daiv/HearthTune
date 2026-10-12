import { Playlist } from "@/types/types";
import mongoose, { model } from "mongoose";

const playListSchema = new mongoose.Schema<Omit<Playlist, 'id'>>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  songs: {
    type: [String],
    required: true,
  },
  title: {
    type: String,
    required: true,
  }
});

export const PlayListModel = model<Playlist>('PlayList', playListSchema);
