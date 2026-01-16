import { Readable } from "node:stream";
import { ISongsProvider } from "../interfaces/ISongsProvider";
import { Song } from "../types/types";

export class MockProvider implements ISongsProvider {
  searchSongs(query: string, limit: number): Promise<Song[]> {
    return new Promise(resolve => {

      const songs: Song[] = [];
      for (let i = 0; i < limit; i++) {
        const song: Song = {
          id: `${i}`,
          title: `title ${i}`,
          description: `query=${query}`,
          duration: `limit=${limit}`,
        }
        songs.push(song);
      }
      resolve(songs);
    });
  }
  getAudioStream(id: string): Promise<Readable> {
    return new Promise(resolve => resolve(new Readable({ read() { } })));
  }
}