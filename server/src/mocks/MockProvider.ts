import { Readable } from "node:stream";
import { ISongsProvider } from "../interfaces/ISongsProvider";
import { Song } from "../types/types";

export class MockProvider implements ISongsProvider {
  searchSongs(query: string, limit: number): Promise<Song[]> {
    return new Promise(resolve => {
      const song: Song = {
        id: '1',
        title: 'title',
        description: 'description',
        duration: 'limit=',
      }
      resolve([song]);
    });
  }
  getAudioStream(id: string): Promise<Readable> {
    return new Promise(resolve => resolve(new Readable()));
  }
}