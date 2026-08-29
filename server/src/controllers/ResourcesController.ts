import { IResourcesController } from "@/interfaces/IResourcesController";
import { ResourcesService } from "@/services/ResourcesService";
import { Request, Response } from 'express';

export class ResourcesController implements IResourcesController {
  constructor(private resourcesService: ResourcesService) { }

  downloadAndroidApp = (req: Request, res: Response) => {
    console.log('starting download');
    try {
      const path = this.resourcesService.getAndroidAppDownloadPath();
      console.log('path is', path);
      res.download(this.resourcesService.getAndroidAppDownloadPath());
    } catch (error) {
      console.error(error);
    }
  }
}