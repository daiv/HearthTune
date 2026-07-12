import express from 'express';
import { SongController } from '@/controllers/SongController';
import { checkValidationToken } from './middleware/checkValidationToken';
import { AuthService, SongService } from './services';
import { AuthController } from './controllers/AuthController';
import { ActivationService } from './services/ActivationService';

export function createRouter(songService: SongService, activationService: ActivationService, authController: AuthController) {
  const router = express.Router();
  const songController = new SongController(songService);
  router.get('/song/play/:id/:provider', songController.playSong);

  router.get('/validation/:token', checkValidationToken(activationService), authController.validate);

  router.post('/validation/:token', checkValidationToken(activationService), authController.validateForm);

  router.post('/request-new-link/', authController.requestNewLink);

  router.get('/allow-new-link/:token', authController.allowNewLink);

  return router;
}