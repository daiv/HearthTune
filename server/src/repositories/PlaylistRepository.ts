import { Song } from "@/common/types";
import { IPlaylistRepository } from "@/interfaces";
import { PlayListModel } from "@/models/playListModel";
import { MongoPlayList, PlayList } from "@/types/types";
import mongoose from "mongoose";

export class PlayListRepository implements IPlaylistRepository {

  async saveList(list: PlayList | MongoPlayList): Promise<MongoPlayList | null> {
    const { id, userId, songs, title } = list;
    if (songs.length === 0 || !userId || !title) return null;

    const isStringArray = (array: string[] | Song[]): array is string[] => {
      return typeof array[0] === 'string'
    }

    const songIds: string[] = isStringArray(songs) ? songs : songs.map(s => s.id);

    if (id) {
      if (!mongoose.isValidObjectId(id)) return null;

      const updated = await PlayListModel.findByIdAndUpdate(
        id,
        { userId, songs: songIds, title },
        { returnDocument: 'after', lean: true }
      );
      console.log('updated is ', updated);
      if (!updated) return null;

      return updated as MongoPlayList;
    }

    const created = await PlayListModel.create({
      userId,
      songs: songIds,
      title
    });

    const playListObject = created.toObject() as MongoPlayList;

    return playListObject;

  }

  async getLists(userId: string): Promise<MongoPlayList[]> {
    const lists = await PlayListModel.find({ userId }).lean();
    if (!lists || lists.length === 0) return [];
    return lists;
  }

  async removeList(listId: string, userId: string): Promise<boolean> {
    const result = await PlayListModel.deleteOne({
      _id: listId,
      userId
    })
    return (result.deletedCount ?? 0) > 0;
  }


}