import { Request, Response } from 'express';
import { ISongService } from '../interfaces/ISongService';

export class SongController {
  constructor(private service: ISongService) { }

  searchSong = async (req: Request, res: Response) => {
    const { q: query, l: limit } = req.query;
    if (!query || typeof query !== 'string') return res.status(400).send('Bad request');

    const parsedLimit = parseInt(limit as string, 10) || 10;

    const songs = await this.service.search(query, parsedLimit);
    console.log('songs', songs);
    res.json(songs);
  }
  playSong = (async (req: Request, res: Response) => {
    const { user } = { user: 'developer' };//req.header 
    const { id: ytId = 'unknown' } = req.params;
    const idPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (!idPattern.test(ytId)) {
      return res.status(400).send('Invalid id format');
    }
    const audioStream = await this.service.getAudioStream(ytId,
      async function onSuccess() {
        //save in db
      },
      function onFail() {
        if (!res.headersSent) res.status(500).send('Streaming error');
      }
    );

    res.setHeader('Content-Type', 'audio/mp4');
    audioStream.pipe(res);
    res.on('close', () => {
      audioStream.unpipe(res);
      audioStream.destroy();
      console.log('user disconnected but song still downloading in server ');
    });
  });
}