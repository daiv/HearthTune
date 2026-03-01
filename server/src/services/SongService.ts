import { PassThrough } from "node:stream";
import { ISongService, ISongsProvider, ISongRepository } from "@/interfaces";
import fs from 'fs';
import { RawSong, SongResponse } from "../types/types";
import { DownloadStatus, Song } from "@/common/types";
import { join } from "node:path";
import { InvalidIdException, ServerError } from "../errors/ServerError";

export class SongService implements ISongService {
  MAX_LIMIT = 50;
  private songsCache = new Map<string, Song>();
  private readonly PATH = join(process.cwd(), 'storage', 'music');
  private activeSources = new Map<string, PassThrough>();
  constructor(private provider: ISongsProvider, private songRepository: ISongRepository) { }

  private extractAndCacheSong = (rawSong: RawSong): Song => {
    const song: Song = {
      id: rawSong.id,
      description: rawSong.description || '',
      duration: Number(rawSong.duration),
      title: rawSong.title,
      status: DownloadStatus.DownloadPending
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
    const songs: Song[] = result
      .map(this.extractAndCacheSong);
    return songs;
  }

  async getRelatedSongs(id: string, numberOfSongs: number = 10): Promise<Song[]> {
    if (!this.provider.isValidId(id)) throw new Error('Bad id');
    else {
      const result = await this.provider.getRelated(id, numberOfSongs);
      const rawToSong = result.map(this.extractAndCacheSong);
      return rawToSong;
    }
  }

  async getAudioSource(id: string): Promise<SongResponse> {
    if (!this.provider.isValidId(id)) throw new InvalidIdException();

    const localPath = join(this.PATH, `${id}.m4a`);
    let song = await this.songRepository.getSongDetails(id);
    if (!song) song = await this.saveSongOnDb(id);
    if (!song) throw new ServerError('Unable to get song info');

    console.log('song status is', song.status);

    if (song.status === DownloadStatus.Ready && fs.existsSync(join(this.PATH, `${id}.m4a`)))
      return { type: 'local', localPath };

    if (this.activeSources.has(id)) {
      return { type: 'external', stream: this.activeSources.get(id)! }
    }

    const combinedStream = new PassThrough();
    this.activeSources.set(id, combinedStream);

    const source = await this.provider.getAudioStream(id);
    const fileWriter = fs.createWriteStream(localPath);
    source.pipe(fileWriter);
    source.pipe(combinedStream);

    await this.songRepository.setSongState(id, DownloadStatus.Downloading);

    source.on('end', async () => {
      this.activeSources.delete(id);
      await this.songRepository.setSongState(id, DownloadStatus.Ready)
      combinedStream.end();
    });

    source.on('error', async err => {
      this.activeSources.delete(id);
      await this.songRepository.setSongState(id, DownloadStatus.Error);
      combinedStream.destroy(err);
    });
    return { type: 'external', stream: combinedStream }
  }

  private async saveSongOnDb(id: string): Promise<Song | null> {
    const song: Song =
      this.songsCache.get(id)
      ||
      this.extractAndCacheSong((await this.provider.searchSongs(id, 1))[0]);
    if (!song) return null;
    await this.songRepository.save(song);
    return song;
  }
}