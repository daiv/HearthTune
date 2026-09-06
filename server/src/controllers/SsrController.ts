import { render } from "@/helpers";
import { ISsrController } from "@/interfaces/ISsrController";
import { AuthService } from "@/services";
import { ResourcesService } from "@/services/ResourcesService";
import { Request, Response } from "express";

export class SsrController implements ISsrController {

  constructor(private authService: AuthService, private resourcesService: ResourcesService) { }

  renderDashboard(req: Request, res: Response): void {
    render(res, 'dashboard', {
      title: 'dashBoard', actions: [
        { name: 'reset password', url: 'b' },
        { name: 'download apk', url: 'apk-download' },
      ],
    });
  };

  renderApkDownload(req: Request, res: Response): void {
    render(res, 'authenticate', { title: 'Download app', buttonText: 'Login', action: '/apk-download' });
  }

  downloadApk = async (req: Request, res: Response): Promise<void> => {
    const url = this.resourcesService.getAndroidAppDownloadPath();
    res.download(url);
  }

  renderResetPassword(req: Request, res: Response): void {
    //todo show view to enter email
  }
  resetPassword(req: Request, res: Response): void {
    //todo if email is valid create 30 mins signed url to reset password and send it via email
  }
}