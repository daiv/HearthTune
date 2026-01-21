import { Readable } from "node:stream";
import { RawSong } from "../types/types";

export interface ISongsProvider {
  searchSongs(query: string, limit: number): Promise<RawSong[]>;
  getAudioStream(id: string): Promise<Readable>;
  isValidId(id: string): boolean;
  getRelated(id: string, songs: number): Promise<RawSong[]>;
}