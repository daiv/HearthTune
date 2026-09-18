import { Request, Response } from 'express';
export interface ISsrController {
  renderDashboard: (req: Request, res: Response) => void;

  renderApkDownload: (req: Request, res: Response) => void;
  apkDownload: (req: Request, res: Response) => void;

  renderResetPassword: (req: Request, res: Response) => void;
  resetPassword: (req: Request, res: Response) => Promise<void>;

  renderSetPassword: (req: Request, res: Response) => void;
  setPassword: (req: Request, res: Response) => Promise<void>;

  renderCreateAccount: (req: Request, res: Response) => void;
  createAccount: (req: Request, res: Response) => Promise<void>;

  requestNewLink: (req: Request, res: Response) => void;
  allowNewLink: (req: Request, res: Response) => Promise<void>;
}