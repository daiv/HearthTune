import { Song } from "@/common/types";
import { ILikeRepository } from "@/interfaces/ILikeRepository";
import { ILikeService } from "@/interfaces/ILikeService";

export class LikeService implements ILikeService {
  constructor(private likeRepo: ILikeRepository) { }
  async toggleLike(userId: string, songId: string): Promise<boolean> {
    const isLiked = await this.likeRepo.toggleLike(userId, songId);
    return isLiked;
  }
  async getLikedSongsByUser(userId: string): Promise<Song[]> {
    const likedSongs = await this.likeRepo.getLikedSongsByUser(userId);
    return likedSongs;
  }
  async isLiked(userId: string, songId: string): Promise<boolean> {
    const isLiked = await this.likeRepo.isLiked(userId, songId);
    return isLiked;
  }
}