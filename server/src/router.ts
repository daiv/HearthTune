import express from 'express';
import { AuthService, SongService, ActivationService } from './services';
import {  ResourcesController, SongController, SsrController } from './controllers';
import { checkValidationToken, createAppDownloadGuard, createStreamGuard } from './middleware';
import { requireDashboardAuth } from './middleware/requireDashboardAuth';
import { checkResetPasswordToken } from './middleware/checkResetPassToken';

export function createRouter
  (
    activationService: ActivationService,
    authService: AuthService,
    songService: SongService,
    resourcesController: ResourcesController,
    ssrController: SsrController,
  ) {

  const router = express.Router();
  const songController = new SongController(songService);

  router.get('/song/play', createStreamGuard(authService), songController.playSong);

  router.get('/dashboard', ssrController.renderDashboard);

  router.get('/apk-download-signed', createAppDownloadGuard(authService), resourcesController.downloadAndroidApp);

  router.get('/apk-download', ssrController.renderApkDownload);
  router.post('/apk-download', requireDashboardAuth(authService), ssrController.apkDownload);

  router.get('/reset-password', ssrController.renderResetPassword);
  router.post('/reset-password', ssrController.resetPassword);

  router.get('/set-new-password/:token', checkResetPasswordToken(authService), ssrController.renderSetPassword);
  router.post('/set-new-password/', checkResetPasswordToken(authService), ssrController.setPassword);

  router.get('/create-account/:token', checkValidationToken(activationService), ssrController.renderCreateAccount);
  router.post('/create-account', checkValidationToken(activationService), ssrController.createAccount);

  router.post('/request-new-link', ssrController.requestNewLink);
  router.get('/allow-new-link/:token', ssrController.allowNewLink);

  return router;

}