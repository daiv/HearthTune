import { Song } from "../types/types";

export interface ISongService {
  search(query: string, limit: number): Promise<Song[]>;
}

