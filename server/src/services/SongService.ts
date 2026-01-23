import { PassThrough, Readable } from "node:stream";
import { ISongService, ISongsProvider, ISongRepository } from "@/interfaces";
import fs from 'fs';
import { RawSong } from "../types/types";
import { DownloadStatus, Song } from "@/common/types";
import { join } from "node:path";



export class SongService implements ISongService {
  MAX_LIMIT = 50;//increase this to 50-100
  private songsCache = new Map<string, Song>();

  constructor(private provider: ISongsProvider, private songRepository: ISongRepository) { }

  extractAndCacheSong = (rawSong: RawSong): Song => {
    const song: Song = {
      id: rawSong.id,
      description: rawSong.description || '',
      duration: Number(rawSong.duration),
      title: rawSong.title
    };
    this.songsCache.set(song.id, song);
    return song;
  }

  async search(query: string, limit: number): Promise<Song[]> {

    const sanitizedQuery = query
      .replace(/[^\w\s\u00C0-\u017F!$&\-\.\+_]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const clampedLimit = Math.min(Math.max(1, limit), this.MAX_LIMIT);
    const result = await this.provider.searchSongs(sanitizedQuery, clampedLimit);
    // console.log('RESULT', result);
    const songs: Song[] = result
      .map(this.extractAndCacheSong);
    return songs;
  }

  async getRelated(id: string, numberOfSongs: number = 10) {
    if (!this.provider.isValidId(id)) throw new Error('Bad id');
    else {
      const result = await this.provider.getRelated(id, numberOfSongs);
      const rawToSong = result.map(this.extractAndCacheSong);
      // console.log('RAW_TO_SONG', rawToSong);
      return rawToSong;
    }
  }
  async getAudioStream(id: string): Promise<Readable> {
    if (!this.provider.isValidId(id)) throw new Error('Bad id');

    const filePath = join(process.cwd(), 'storage', 'music', `${id}.m4a`);
    if (await this.songRepository.isReady(id)
      &&
      fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);

    } else return this.getAudioStreamAndSave(id, filePath);
  }

  async getAudioStreamAndSave(id: string, filePath: string): Promise<Readable> {
    const song: Song = this.songsCache.get(id) ||
      this.extractAndCacheSong(
        (await this.provider.searchSongs(id, 1))[0]);
    if (!song) throw new Error('Unable to get song info');

    await this.songRepository.save(song);

    const userTunnel = new PassThrough();
    try {
      const audioStream = await this.provider.getAudioStream(id);
      const fileWriter = fs.createWriteStream(filePath);

      const handleError = (error: unknown) => {
        fileWriter.destroy();
        userTunnel.destroy(error instanceof Error ? error : new Error(String(error)));
        this.songRepository.setSongState(id, DownloadStatus.Error);
        fs.unlink(filePath, () => { });
      };
      fileWriter.on('error', handleError);
      audioStream.on('error', handleError);

      audioStream.pipe(fileWriter);
      audioStream.pipe(userTunnel);
      fileWriter.on('finish', async () => {
        try {
          const stats = fs.statSync(filePath);
          if (stats.size === 0) return handleError(new Error('Empty file '));

          await this.songRepository.setSongState(id, DownloadStatus.Ready);

        } catch (error) {
          handleError(error);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof (Error) ? error.message : error;
      console.error(errorMessage);
      await this.songRepository.setSongState(id, DownloadStatus.Error);
      userTunnel.destroy();
    }

    return userTunnel;

  }

}