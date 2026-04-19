import { Song } from "@/common/types";
import { SongResponse } from "@/types/types";

export interface ISongService {
  search
    (
      query: string,
      limit?: number
    )
    : Promise<Song[]>;

  getRelatedSongs
    (
      id: string,
      numberOfSongs?: number
    )
    : Promise<Song[]>;

  getAudioSource(id: string, source?: string): Promise<SongResponse>

}

