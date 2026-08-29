import express, { Request, Response } from 'express';
import { SongController } from '@/controllers/SongController';
import { checkValidationToken } from './middleware/checkValidationToken';
import { AuthService, SongService } from './services';
import { AuthController } from './controllers/AuthController';
import { ActivationService } from './services/ActivationService';
import { createStreamGuard } from './middleware/streamGuard';
import { createAppDownloadGuard } from './middleware/AppDownloadGuard';
import { ResourcesController } from './controllers/ResourcesController';

export function createRouter
  (
    activationService: ActivationService,
    authService: AuthService,
    songService: SongService,
    authController: AuthController,
    resourcesController: ResourcesController,
  ) {

  const router = express.Router();
  const songController = new SongController(songService);

  router.get('/song/play/', createStreamGuard(authService), songController.playSong);

  router.get('/validation/:token', checkValidationToken(activationService), authController.validate);

  router.post('/validation/:token', checkValidationToken(activationService), authController.validateForm);

  router.post('/request-new-link/', authController.requestNewLink);

  router.get('/allow-new-link/:token', authController.allowNewLink);

  router.get('/app-download', createAppDownloadGuard(authService), resourcesController.downloadAndroidApp);

  return router;

  /*
  download app
  reset password
  */

}