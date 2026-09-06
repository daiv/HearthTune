import { Request, Response } from 'express'
export interface IAuthController {
  validate: (req: Request, res: Response) => Promise<void>;
  validateForm: (req: Request, res: Response) => Promise<void>;
  requestNewLink: (req: Request, res: Response) => Promise<void>;
  allowNewLink: (req: Request, res: Response) => Promise<void>;
  renderSsrLogin: (req: Request, res: Response) => Promise<void>;
  ssrLogin: (req: Request, res: Response) => Promise<void>;
}