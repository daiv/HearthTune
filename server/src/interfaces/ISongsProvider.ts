import { Readable } from "node:stream";
import { Song } from "@/common/types";

export interface ISongsProvider {
  readonly SOURCE: 'Youtube' | 'Soundcloud';
  readonly FILE_EXTENSION: 'mp3' | 'm4a';
  isValidId(id: string): boolean;
  searchSongs(query: string, limit?: number): Promise<Song[]>;
  getRelated(id: string, songs: number): Promise<Song[]>;
  getAudioStream(id: string): Promise<Readable>;
}