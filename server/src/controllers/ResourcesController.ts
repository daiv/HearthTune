import { AuthService } from "@/services";
import { ResourcesService } from "@/services/ResourcesService";
import { Request, Response } from 'express';

export class ResourcesController {
  constructor(private resourcesService: ResourcesService, private authService: AuthService) { }

  downloadAndroidApp = (req: Request, res: Response) => {
    try {
      res.download(this.resourcesService.getAndroidAppDownloadPath());
    } catch (error) {
      console.error(error);
    }
  }
}