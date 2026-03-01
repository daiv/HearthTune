import { Readable } from "node:stream";
import { DownloadStatus, Song } from "@/common/types";
import { SongResponse } from "@/types/types";

export interface ISongService {
  search
    (
      query: string,
      limit: number
    )
    : Promise<Song[]>;

  getRelatedSongs
    (
      id: string
    )
    : Promise<Song[]>;

  getAudioSource(id: string): Promise<SongResponse>

}

