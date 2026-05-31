import express from 'express';
import { Request, Response } from 'express'
import { SongController } from '@/controllers/songController';
import { ISongService } from '@/interfaces';

export function createRouter(songService: ISongService) {
  const router = express.Router();
  const songController = new SongController(songService);

  router.get('/song/play/:id/:provider', songController.playSong);

  router.get('/validation/:token', (req: Request, res: Response) => {
    const { token } = req.params;
    console.log('token is', token);

  });

  return router;
}