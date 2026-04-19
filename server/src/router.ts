import express from 'express';
import { SongController } from '@/controllers/songController';
import { ISongService } from '@/interfaces';

export function createRouter(songService: ISongService) {
  const router = express.Router();
  const songController = new SongController(songService);

  router.get('/song/play/:id/:provider', songController.playSong);

  return router;
}