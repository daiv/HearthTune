import { PassThrough, Readable } from "node:stream";
import { ISongService } from "../interfaces/ISongService";
import { ISongsProvider } from "../interfaces/ISongsProvider";
import fs from 'fs'
export class SongService implements ISongService {
  MAX_LIMIT = 10;

  constructor(private provider: ISongsProvider) { }

  async search(query: string, limit: number) {

    const sanitizedQuery = query
      .replace(/[^\w\s\u00C0-\u017F!$&\-\.\+_]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const clampedLimit = Math.min(Math.max(1, limit), this.MAX_LIMIT);

    return this.provider.searchSongs(sanitizedQuery, clampedLimit);
  }
  async getAudioStream(id: string, onSuccess: () => Promise<void>, onFail: () => void): Promise<PassThrough> {

    const audioStream = await this.provider.getAudioStream(id);
    const filePath = `/app/storage/music/${id}.m4a`;
    const fileWriter = fs.createWriteStream(filePath);

    const userTunnel = new PassThrough();

    audioStream.pipe(fileWriter);
    audioStream.pipe(userTunnel);

    fileWriter.on('finish', async () => {
      fileWriter.close();
      await onSuccess();
    });
    audioStream.on('error', err => {
      fileWriter.destroy();
      onFail();
    });

    return userTunnel;
  }
}