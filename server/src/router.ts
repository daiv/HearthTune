import express from 'express';
import { SongController } from '@/controllers/SongController';
import { ISongService } from '@/interfaces';
import { AuthController } from './controllers/AuthController';

export function createRouter(songService: ISongService, authController: AuthController) {
  const router = express.Router();
  const songController = new SongController(songService);
  router.get('/song/play/:id/:provider', songController.playSong);

  router.get('/validation/:token', authController.validate);

  router.post('/validation/:token', authController.validateForm);

  return router;
}