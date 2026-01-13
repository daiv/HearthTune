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

}