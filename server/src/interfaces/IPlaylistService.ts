import { Role, Playlist } from "@/types/types";

export interface IPLaylistService {
  getPlaylistsByUserId: (userId: string) => Promise<Playlist[]>;
  getPlaylistById: (id: string, userId: string) => Promise<Playlist | null>;
  savePlaylist: (list: Playlist | Playlist, userId: string, role: Role) => Promise<Playlist | null>;
  removePlaylist: (listId: string, userId: string) => Promise<boolean>;
}