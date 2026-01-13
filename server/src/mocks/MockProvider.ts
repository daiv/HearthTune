import { ISongsProvider } from "../interfaces/ISongsProvider";
import { Song } from "../types/types";

export class MockProvider implements ISongsProvider {
  searchSongs(query: string, limit: number): Promise<Song[]> {
    return new Promise((resolve, reject) => {
      const song: Song = {
        id: '1',
        title: 'title',
        description: 'description',
        duration: 'limit=',
      }
      resolve([song]);
    });
  }
}