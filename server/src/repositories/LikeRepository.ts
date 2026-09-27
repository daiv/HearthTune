import { Song } from "@/common/types";
import { ILikeRepository } from "@/interfaces/ILikeRepository";
import { LikeModel } from "@/models/likeSongModel";
import { SongModel } from "@/models/songModel";

export class LikeRepository implements ILikeRepository {
  async toggleLike(userId: string, songId: string): Promise<boolean> {
    const existingLike = await LikeModel.findOne({ userId, songId });
    if (existingLike) {
      await LikeModel.deleteOne({ userId });
      return false;
    } else {
      await LikeModel.create({ userId, songId });
      return true;
    }
  }

  async isLiked(userId: string, songId: string): Promise<boolean> {
    const existingLike = await LikeModel.findOne({ userId, songId });
    return !!existingLike;
  }

  async getLikedSongsByUser(userId: string): Promise<Song[]> {
    const likes = await LikeModel.find({ userId });
    if (!likes || likes.length === 0) return [];

    const songIds = likes.map(like => like.songId);
    const songs: Song[] = await SongModel.find({ id: { $in: songIds } });
    return songs;
  }
}