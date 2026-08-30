import { Request, Response } from 'express';
export interface IResourcesController {
  downloadAndroidApp: (req: Request, res: Response) => void;
  renderDownloadLogin: (req: Request, res: Response) => void;
  downloadAndroidAppWithCredentials: (req: Request, res: Response) => void;
}