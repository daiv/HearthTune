import { AuthService } from "@/services";
import { ResourcesService } from "@/services/ResourcesService";
import { Request, Response } from 'express';
import { existsSync } from "node:fs";

export class ResourcesController {
  constructor(private resourcesService: ResourcesService, private authService: AuthService) { }

  downloadAndroidApp = (req: Request, res: Response) => {
    try {
      const downloadUrl = this.resourcesService.getAndroidAppDownloadPath();

      if (!existsSync(downloadUrl)) {
        console.error('File not exist', downloadUrl);
      }
      console.log('downloadUrl is ', downloadUrl);
      res.download(downloadUrl, err => {
        console.error('download error', err);
      });
    } catch (error) {
      console.error(error);
    }
  }
}