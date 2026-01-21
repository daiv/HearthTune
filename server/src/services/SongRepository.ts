import { DeleteResult, UpdateWriteOpResult } from "mongoose";
import { ISongRepository } from "@/interfaces";
import { SongModel } from "../models/songModel";
import { DownloadStatus, Song } from "../types/types";

export class SongRepository implements ISongRepository {

  async save(song: Song) {
    return await SongModel.findOneAndUpdate(
      { id: song.id },
      { $set: song },
      { upsert: true, new: true }
    );
  }

  async exists(id: string): Promise<boolean> {
    const count = await SongModel.countDocuments({ id }, { limit: 1 }).lean();
    return count > 0;
  }

  async isReady(id: string): Promise<boolean> {
    const count = await SongModel.countDocuments({ id, status: DownloadStatus.Ready }, { limit: 1 }).lean();
    return count > 0;
  }

  async addOneMorePlayed(id: string): Promise<UpdateWriteOpResult> {
    return await SongModel.updateOne(
      { id },
      {
        $inc: { played: 1 },
        $currentDate: { lastPlayed: true }
      }
    );
  }

  async setSongState(id: string, status: DownloadStatus): Promise<boolean> {
    return (await SongModel.updateOne({ id }, { status })).matchedCount === 1;
  }

  async delete(id: string): Promise<DeleteResult> {
    return await SongModel.deleteOne({ id });
  }

  async getSongDetails(id: string): Promise<Song | null> {
    return await SongModel.findOne({ id });
  }
}