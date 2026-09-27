import { Song } from "@/common/types";
import mongoose from "mongoose";

export interface ILikeRepository {
  toggleLike(userId: string, songId: string): Promise<boolean>;
  isLiked(userId: string, songId: string): Promise<boolean>;
  getLikedSongsByUser(userId: string): Promise<Song[]>;
}