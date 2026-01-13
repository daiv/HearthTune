import { Song } from "../types/types";

export interface ISongsProvider {
  searchSongs(query: string, limit: number): Promise<Song[]>;
}