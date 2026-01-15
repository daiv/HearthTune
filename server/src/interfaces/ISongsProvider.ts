import { Readable } from "node:stream";
import { Song } from "../types/types";

export interface ISongsProvider {
  searchSongs(query: string, limit: number): Promise<Song[]>;
  getAudioStream(id: string): Promise<Readable>;

}