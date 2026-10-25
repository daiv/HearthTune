import { Playlist } from "@/common/types";
import { IPlaylistRepository } from "@/interfaces";
import { PlayListModel } from "@/models/playListModel";
import mongoose from "mongoose";

type PlaylistDoc = {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  songs: string[];
}

export class PlayListRepository implements IPlaylistRepository {

  async saveList(list: Playlist): Promise<Playlist | null> {
    const { id, userId, title } = list;
    let { songs } = list;

    const isNew = !id;
    if (isNew) {
      if (!songs || songs.length === 0 || !userId || !title) return null;
    } else {
      if (!id || !title || !userId) return null;
      if (!mongoose.isValidObjectId(id)) return null;

      const existingDoc = await PlayListModel.findById(id).lean<PlaylistDoc | null>();
      if (!existingDoc || existingDoc.userId !== userId) return null;

      if (!songs || songs.length === 0) {
        songs = existingDoc.songs ?? [];
      }
    }

    if (id) {
      const objectId = new mongoose.Types.ObjectId(id);
      const updated: PlaylistDoc | null = await PlayListModel.findByIdAndUpdate(
        objectId,
        { userId, songs, title },
        { returnDocument: 'after' }
      ).lean<PlaylistDoc | null>();

      if (!updated) return null;
      return this.toPlaylist(updated);
    }

    const created = await PlayListModel.create({
      userId,
      songs,
      title
    });

    const rawCreated = created.toObject();
    return this.toPlaylist({
      ...rawCreated,
      songs: rawCreated.songs ?? []
    });
  }

  async getLists(userId: string): Promise<Playlist[]> {
    const lists: PlaylistDoc[] = await PlayListModel.find({ userId }).lean<PlaylistDoc[]>();
    if (!lists || lists.length === 0) return [];
    return lists.map(this.toPlaylist);
  }

  async removeList(listId: string, userId: string): Promise<boolean> {
    const result = await PlayListModel.deleteOne({
      _id: listId,
      userId
    });
    return (result.deletedCount ?? 0) > 0;
  }

  async getListById(listId: string): Promise<Playlist | null> {
    if (!mongoose.isValidObjectId(listId)) return null;

    const result = await PlayListModel.findById(listId).lean<PlaylistDoc | null>();
    if (!result) return null;
    return this.toPlaylist(result);
  }

  private toPlaylist(list: PlaylistDoc): Playlist {
    const { _id, ...rest } = list;
    const playlist: Playlist = {
      ...rest,
      id: _id.toString(),
      songs: list.songs ?? []
    };
    return playlist;
  }
}