import { Readable } from "node:stream";
import { Song } from "../types/types";

export interface ISongService {
  search(query: string, limit: number): Promise<Song[]>;

  getAudioStream
    (
      id: string,
      onSuccess: () => Promise<void>,
      onFail: () => void
    )
    : Promise<Readable>;
}

