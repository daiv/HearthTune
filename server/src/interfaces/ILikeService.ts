import { Song } from "@/common/types";

export interface ILikeService {
  toggleLike(userId: string, songId: string): Promise<boolean>;
  isLiked(userId: string, songId: string): Promise<boolean>;
  getLikedSongsByUser(userId: string): Promise<Song[]>;
}