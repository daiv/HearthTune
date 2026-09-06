import express from 'express';
import { AuthService, SongService, ActivationService } from './services';
import { AuthController, ResourcesController, SongController, SsrController } from './controllers';
import { checkValidationToken, createStreamGuard } from './middleware';
import { requireDashboardAuth } from './middleware/requireDashboardAuth';

export function createRouter
  (
    activationService: ActivationService,
    authService: AuthService,
    songService: SongService,
    authController: AuthController,
    resourcesController: ResourcesController,
    ssrController: SsrController
  ) {

  const router = express.Router();
  const songController = new SongController(songService);

  router.get('/song/play', createStreamGuard(authService), songController.playSong);

  router.get('/validation/:token', checkValidationToken(activationService), authController.validate);

  router.post('/validation/:token', checkValidationToken(activationService), authController.validateForm);

  router.post('/request-new-link', authController.requestNewLink);

  router.get('/allow-new-link/:token', authController.allowNewLink);


  router.get('/dashboard', ssrController.renderDashboard);

  router.get('/apk-download', ssrController.renderApkDownload);
  router.post('/apk-download', requireDashboardAuth(authService), ssrController.downloadApk);

  router.get('reset-password', ssrController.renderResetPassword);
  router.post('reset-password', ssrController.resetPassword);

  return router;

}