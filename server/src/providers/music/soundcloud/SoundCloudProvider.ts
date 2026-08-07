import { spawn } from "node:child_process";
import { ISongsProvider } from "@/interfaces";
import { Readable } from "node:stream";
import { Song } from "@/common/types";

export class SoundCloudProvider implements ISongsProvider {
  readonly SOURCE = "Soundcloud";
  readonly FILE_EXTENSION = "mp3"

  userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/119.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ... Safari/13.1.2',
    'Mozilla/5.0 (X11; Linux x86_64) ... Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ];
  randomUA = () => this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

  isValidId(id: string): boolean {
    return !isNaN(Number(id));
  }

  async searchSongs(query: string, limit: number = 10): Promise<Song[]> {

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
        '--default-search', `scsearch${limit}`,
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
          const songs: any[] = rawResult
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => JSON.parse(line));
          resolve(songs.map(this.rawToSong));

        } catch (error) {
          console.error('error parsing');
          reject(new Error('Error parsing JSON'));
        }
      });
    })
  }

  private rawToSong = (rawSong: any): Song => {
    const song: Song = {
      id: String(rawSong.id) || 'asdf',
      description: rawSong.description || '',
      duration: Math.floor(Number(rawSong.duration)) || 0,
      title: rawSong.title || '',
      source: this.SOURCE,
      url: rawSong.webpage_url
    };
    console.log('rawsong', rawSong);
    return song;
  }

  async getRelated(id: string, songs: number): Promise<Song[]> {
    return new Promise((resolve, reject) => {
      const mixUrl = `https://www.youtube.com/watch?v=${id}&list=RD${id}`;
      const child = spawn('yt-dlp', [
        '--user-agent', this.randomUA(),
        '--dump-single-json',
        '--no-check-certificates',
        '--geo-bypass',
        '--simulate',
        '--flat-playlist',
        '--no-warnings',
        '--playlist-items', `1:${songs + 1}`,
        '--add-header', 'Accept-Language: es-ES,es;q=0.9',
        '--',
        mixUrl
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

          const related: any[] = (data.entries || []).slice(1);
          resolve(related.map(this.rawToSong));
        } catch (error) {
          reject(new Error('Error parsing json'));
        }
      });
      child.on('error', error => {
        reject(new Error('Failed process: ' + error));
      })
    });
  }

  async getAudioStream(targetUrl: string): Promise<Readable> {

    const child = spawn('yt-dlp', [
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--no-check-certificates',
      '--geo-bypass',
      '--force-ipv4',
      '-f', 'ba[protocol^=http]',
      '-o', '-',
      '--no-playlist',
      '--add-header', 'Referer:https://soundcloud.com/',
      '--',
      targetUrl
    ]);

    child.stderr.on('data', errorData => {
      const msg = errorData.toString();
      /* if (msg.includes('ERROR'))  */console.error('yt-dlp error:', msg);
    });

    child.on('error', err => {
      console.error('yt-dlp spawn error:', err.message);
      child.kill();
    });

    return child.stdout;
  }
}

/*songObject= {
   id: '1586062627',
   uploader: 'Kaleb Di Masi',
   uploader_id: '1138941073',
   uploader_url: 'https://soundcloud.com/kalebdimasi-music',
   timestamp: 1691427496,
   title: 'LA FUGA (Remix)',
   track: 'LA FUGA (Remix)',
   description: null,
   thumbnails: [
     {
       id: 'mini',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-mini.jpg',
       width: 16,
       height: 16
     },
     {
       id: 'tiny',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-tiny.jpg',
       width: 20,
       height: 20
     },
     {
       id: 'small',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-small.jpg',
       width: 32,
       height: 32
     },
     {
       id: 'badge',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-badge.jpg',
       width: 47,
       height: 47
     },
     {
       id: 't67x67',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-t67x67.jpg',
       width: 67,
       height: 67
     },
     {
       id: 'large',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-large.jpg',
       width: 100,
       height: 100
     },
     {
       id: 't300x300',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-t300x300.jpg',
       width: 300,
       height: 300
     },
     {
       id: 'crop',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-crop.jpg',
       width: 400,
       height: 400
     },
     {
       id: 't500x500',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-t500x500.jpg',
       width: 500,
       height: 500
     },
     {
       id: 'original',
       url: 'https://i1.sndcdn.com/artworks-VInt3zhNifBH-0-original.png',
       preference: 10
     }
   ],
   duration: 205.823,
   webpage_url: 'https://soundcloud.com/kalebdimasi-music/la-fuga-remix',
   license: 'all-rights-reserved',
   view_count: 4189,
   like_count: 105,
   comment_count: 0,
   repost_count: 1,
   genres: [ 'Latin' ],
   tags: [],
   artists: [ 'Kaleb Di Masi, Gusty dj, elaggume and DobleP' ],
   formats: null,
   ie_key: 'Soundcloud',
   _type: 'url',
   url: 'https://api.soundcloud.com/tracks/soundcloud%3Atracks%3A1586062627',
   __x_forwarded_for_ip: null,
   original_url: 'https://api.soundcloud.com/tracks/soundcloud%3Atracks%3A1586062627',
   webpage_url_basename: 'la-fuga-remix',
   webpage_url_domain: 'soundcloud.com',
   extractor: 'soundcloud',
   extractor_key: 'Soundcloud',
   playlist_count: 50,
   playlist: 'La fuga',
   playlist_id: 'La fuga',
   playlist_title: 'La fuga',
   playlist_uploader: null,
   playlist_uploader_id: null,
   playlist_channel: null,
   playlist_channel_id: null,
   playlist_webpage_url: 'scsearch50:La fuga',
   n_entries: 50,
   playlist_index: 50,
   __last_playlist_index: 50,
   playlist_autonumber: 50,
   epoch: 1775994830,
   duration_string: '3:25',
   upload_date: '20230807',
   release_year: null,
   artist: 'Kaleb Di Masi， Gusty dj， elaggume and DobleP',
   genre: 'Latin',
   _version: {
     version: '2026.03.17',
     current_git_head: null,
     release_git_head: '04d6974f502bbdfaed72c624344f262e30ad9708',
     repository: 'yt-dlp/yt-dlp'
   }
 }
*/