import express from 'express';
import { SongController } from './controllers/songController';
import { ISongService } from './interfaces/ISongService';

export function createRouter(songService: ISongService) {
  const router = express.Router();
  const songController = new SongController(songService);
  router.get('/song/search', songController.searchSong);
  router.get('/song/play/:id', songController.playSong);


  return router;
}