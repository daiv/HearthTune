import { Request, Response } from 'express';
export interface IResourcesController {
  downloadAndroidApp: (req: Request, res: Response) => void;
}