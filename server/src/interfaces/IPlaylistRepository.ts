import { MongoPlayList, PlayList } from "@/types/types";

export interface IPlaylistRepository {
  removeList(listId: string, userId: string): Promise<boolean>;
  saveList(list: PlayList | MongoPlayList): Promise<MongoPlayList | null>;
  getLists(userId: string): Promise<MongoPlayList[]>;
}