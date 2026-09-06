import { Request, Response } from 'express';
export interface ISsrController {
  renderDashboard: (req: Request, res: Response) => void;
  downloadApk: (req: Request, res: Response) => void;
  renderResetPassword: (req: Request, res: Response) => void;
  resetPassword: (req: Request, res: Response) => void;
}