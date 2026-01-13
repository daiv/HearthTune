import { spawn } from "node:child_process";
import { ISongsProvider } from "../interfaces/ISongsProvider";
import { Song } from "../types/types";

export class YtDlpProvider implements ISongsProvider {
  userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

  async searchSongs(query: string, limit: number | undefined = 10): Promise<Song[]> {

    return new Promise((resolve, reject) => {
      const child = spawn('yt-dlp', [
        '--user-agent', this.userAgent,
        '--dump-json',
        '--simulate',
        '--flat-playlist',
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
          const songs: Song[] = rawResult
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => {
              const data = JSON.parse(line);
              return {
                id: data.id,
                description: data.description,
                duration: data.duration,
                title: data.title
              }
            });
          resolve(songs);

        } catch (error) {
          reject(new Error('Error parsing JSON'));
        }
      });
    })
  }
}