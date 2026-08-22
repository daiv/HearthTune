import { PassThrough } from "node:stream";
import { ISongService, ISongsProvider, ISongRepository } from "@/interfaces";
import fs from 'fs';
import { SongResponse } from "../types/types";
import { DownloadStatus, Song } from "@/common/types";
import { join } from "node:path";
import { InvalidIdException, ProviderNotFoundException, ServerError } from "../errors/ServerError";

export class SongService implements ISongService {
  MAX_LIMIT = 50;
  private songsCache = new Map<string, Song>();
  private readonly PATH = join(process.cwd(), 'storage', 'music');
  private activeSources = new Map<string, PassThrough>();
  constructor(private providers: ISongsProvider[], private songRepository: ISongRepository) { }

  async searchLocally(query: string): Promise<Song[]> {
    const songs = await this.songRepository.search(query);
    return songs;
  }

  async search(query: string, limit: number = 50): Promise<Song[]> {

    const clampedLimit = Math.min(Math.max(1, limit), this.MAX_LIMIT);

    const searches: Song[] = (await Promise.allSettled(this.providers.map(provider => provider.searchSongs(query, clampedLimit))))
      .filter((res): res is PromiseFulfilledResult<Song[]> => {
        return res.status === 'fulfilled'
      }
      )
      .map(search => search.value)
      .flat();
    const searchesResult: Song[] = (await Promise.allSettled(
      searches.map(async song => {
        const downloadStatus = await this.songRepository.getSongState(song.id) || DownloadStatus.DownloadPending;
        song.local = downloadStatus === DownloadStatus.Ready;
        this.songsCache.set(song.id, song);
        return song;
      })
    )).filter((res): res is PromiseFulfilledResult<Song> => res.status === 'fulfilled')
      .map(res => res.value);
    return searchesResult;
  }

  async getRelatedSongs(id: string, numberOfSongs: number = 10, source = 'Youtube'): Promise<Song[]> {
    const provider = this.providers.find(prov => prov.PROVIDER === source);
    if (!provider) throw new ProviderNotFoundException();

    if (!provider.isValidId(id)) throw new InvalidIdException(id, provider.PROVIDER);

    const songSearch = await provider.getRelated(id, numberOfSongs);

    const result = (await Promise.allSettled(songSearch.map(async song => {
      const downloadStatus = await this.songRepository.getSongState(song.id) || DownloadStatus.DownloadPending;
      song.downloadStatus = downloadStatus;
      song.local = downloadStatus === DownloadStatus.Ready;
      return song;
    })))
      .filter((res): res is PromiseFulfilledResult<Song> => res.status === 'fulfilled')
      .map(res => {
        const song: Song = res.value;
        this.songsCache.set(song.id, song);
        return song;
      });
    return result;
  }

  async getAudioSource(id: string, source: string = 'Youtube', userId: string): Promise<SongResponse> {
    const provider = this.providers.find(provider => provider.PROVIDER === source);

    if (!provider) throw new ProviderNotFoundException();

    if (!provider.isValidId(id)) throw new InvalidIdException(id, provider.PROVIDER);

    const localPath = join(this.PATH, `${id}.${provider.FILE_EXTENSION}`);
    let song = await this.songRepository.getSongDetails(id);
    if (!song) song = await this.saveSongOnDb(id, provider, userId);
    if (!song) throw new ServerError('Unable to get song info');

    if (song.downloadStatus === DownloadStatus.Ready && fs.existsSync(join(this.PATH, `${id}.m4a`)))
      return { type: 'local', localPath };

    if (this.activeSources.has(id)) {
      return { type: 'external', stream: this.activeSources.get(id)! }
    }

    const combinedStream = new PassThrough();
    this.activeSources.set(id, combinedStream);

    const audiostream = await provider.getAudioStream(id);
    const fileWriter = fs.createWriteStream(localPath);
    audiostream.pipe(fileWriter);
    audiostream.pipe(combinedStream);

    await this.songRepository.setSongState(id, DownloadStatus.Downloading);

    const handleCleanUpError = async (err: Error) => {
      console.error(err.message);
      if (!this.activeSources.has(id)) return;
      this.activeSources.delete(id);
      await this.songRepository.setSongState(id, DownloadStatus.Error);
      combinedStream.destroy(err);
      if (fs.existsSync(localPath)) {
        try {
          console.warn('removing empty file: ', localPath);
          fs.unlinkSync(localPath);
        } catch (error) {
          console.error(error);
        }
      }
    };

    audiostream.on('error', handleCleanUpError);
    fileWriter.on('error', handleCleanUpError);

    audiostream.on('end', async () => {
      combinedStream.end();
    });

    fileWriter.on('finish', async () => {
      try {
        const stats = fs.statSync(localPath);
        if (stats.size > 0) {
          await this.songRepository.setSongState(id, DownloadStatus.Ready);
          this.activeSources.delete(id);
        } else throw new Error('File is empty');
      } catch (error) {
        if (error instanceof Error)
          handleCleanUpError(error);
      }
    });

    return { type: 'external', stream: combinedStream }
  }

  private async saveSongOnDb(id: string, provider: ISongsProvider, requestedBy: string): Promise<Song | null> {
    const song = this.songsCache.get(id);
    if (song) {
      const songToSave = { ...song, requestedBy };
      await this.songRepository.save(songToSave);
      return song;
    }

    const newSong = (await provider.searchSongs(id, 1))[0];
    if (!newSong) return null;

    const downloadStatus = await this.songRepository.getSongState(id) || DownloadStatus.DownloadPending;
    newSong.downloadStatus = downloadStatus;
    newSong.local = downloadStatus === DownloadStatus.Ready;
    this.songsCache.set(newSong.id, newSong);

    return newSong;
  }
}