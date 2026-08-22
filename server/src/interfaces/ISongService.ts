import { Song } from "@/common/types";
import { SongResponse } from "@/types/types";
import { ISongsProvider } from "./ISongsProvider";

export interface ISongService {

  searchLocally(query: string)
    : Promise<Song[]>;

  search(
    query: string,
    limit?: number)
    : Promise<Song[]>;

  getRelatedSongs(
    id: string,
    numberOfSongs?: number)
    : Promise<Song[]>;

  getAudioSource(
    id: string,
    provider: string,
    requestedBy: string,

  )
    : Promise<SongResponse>;

  searchLocally(query: string): Promise<Song[]>;





}

