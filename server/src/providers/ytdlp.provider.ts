import { spawn } from "node:child_process";
import { ISongsProvider } from "@/interfaces";
import { RawSong, Song } from "../types/types";
import { Readable } from "node:stream";

export class YtDlpProvider implements ISongsProvider {
  userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/119.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ... Safari/13.1.2',
    'Mozilla/5.0 (X11; Linux x86_64) ... Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ];
  randomUA = () => this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

  isValidId(id: string): boolean {
    const regex = /^[a-zA-Z0-9_-]{11}$/;
    return regex.test(id);
  }

  async searchSongs(query: string, limit: number | undefined = 10): Promise<RawSong[]> {

    return new Promise((resolve, reject) => {
      const child = spawn('yt-dlp', [
        '--user-agent', this.randomUA(),
        '--dump-json',
        '--sleep-requests', '1.5',
        '--no-check-certificates',
        '--geo-bypass',
        '--simulate',
        '--flat-playlist',
        '--add-header', 'Accept-Language: es-ES,es;q=0.9',
        '--default-search', `ytsearch${limit}`,
        '--',
        query
      ]);

      let error = "";
      const chunks: Buffer[] = [];
      child.stdout.on('data', chunk => chunks.push(chunk));
      child.stderr.on('data', err => error += err.toString());
      child.on('close', code => {
        if (code !== 0) return reject(new Error(`Process failed with code ${code}: ${error}`));
        try {
          const rawResult = Buffer.concat(chunks).toString();
          const songs: RawSong[] = rawResult
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => JSON.parse(line));
          resolve(songs);

        } catch (error) {
          reject(new Error('Error parsing JSON'));
        }
      });
    })
  }
  async getRelated(id: string, songs: number): Promise<RawSong[]> {
    return new Promise((resolve, reject) => {

      const child = spawn('yt-dlp', [
        '--user-agent', this.randomUA(),
        '--dump-single-json',
        '--sleep-requests', '1.5',
        '--no-check-certificates',
        '--geo-bypass',
        '--simulate',
        '--flat-playlist',
        '--no-warnings',
        '--add-header', 'Accept-Language: es-ES,es;q=0.9',
        '--',
        `ytsearch${songs}:https://www.youtube.com/watch?v=${id}`
      ]);
      const chunks: Buffer[] = [];
      const errors: string[] = [];
      child.stdout.on('data', chunk => chunks.push(chunk));
      child.stderr.on('data', err => errors.push(err));
      child.on('close', code => {
        if (code != 0) return reject(new Error(errors.toString()));
        try {
          const rawResult = Buffer.concat(chunks).toString();
          const data = JSON.parse(rawResult);

          const related: RawSong[] = (data.entries || []).slice(1);
          resolve(related);
        } catch (error) {
          reject(new Error('Error parsing json'));
        }
      });
      child.on('error', error => {
        reject(new Error('Failed process: ' + error));
      })
    });
  }

  async getAudioStream(ytId: string): Promise<Readable> {
    const child = spawn('yt-dlp', [
      '--user-agent', this.randomUA(),
      '--http-chunk-size', '10M',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=android,web',
      '--add-header', 'Accept:*/*',
      '--add-header', 'Accept-Language: es-Es,es;q=0.9',
      '--add-header', 'Sec-Fetch-Mode: navigate',
      '--geo-bypass',
      '-o', '-',
      // '-f', 'ba[ext=m4a]/ba',
      '-f', 'ba[ext=m4a]',
      '--no-playlist',
      '--',
      ytId
    ]);

    child.stderr.on('data', errorData => {
      const errorMessage = errorData.toString();
      console.error('yt-dlp error', errorMessage);
    });

    child.on('error', err => {
      console.error('yt-dlp error', err.message);
      child.kill();
    });

    return child.stdout;
  }
}