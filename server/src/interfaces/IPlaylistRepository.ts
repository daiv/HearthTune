import { Playlist } from "@/common/types";

export interface IPlaylistRepository {
  removeList(listId: string, userId: string): Promise<boolean>;
  saveList(list: Playlist): Promise<Playlist | null>;
  getLists(userId: string): Promise<Playlist[]>;
  getListById(listId: string): Promise<Playlist | null>;
}