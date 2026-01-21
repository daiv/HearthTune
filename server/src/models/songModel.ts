import mongoose, { model } from "mongoose";
import { DownloadStatus, Song } from '../types/types';

const songSchema = new mongoose.Schema<Song>({
  id:
  {
    type: String,
    required: true,
    unique: true
  },

  description:
  {
    type: String,
    required: false,
    unique: false
  },

  title: {
    type: String,
    required: true,
    unique: false
  },

  duration: {
    type: Number,
    required: true,
    unique: false
  },
  played: {
    type: Number,
    default: 0,
  },
  lastPlayed: {
    type: Date,
    required: false,
    default: Date.now,
  },
  status: {
    type: String,
    default: DownloadStatus.DownloadPending,
  }
});

export const SongModel = model<Song>('Song', songSchema);