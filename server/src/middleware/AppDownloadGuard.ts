import { InvalidTokenException, MissingFieldsException } from '@/errors/ServerError';
import { AuthService } from '@/services';
import { Request, Response, NextFunction } from 'express';


export const createAppDownloadGuard = (authService: AuthService) =>
  (req: Request, res: Response, next: NextFunction) => {

    const { userId, jti, expiresAt, sign } = req.query as { userId: string, jti: string, expiresAt: string, sign: string };
    if (!userId ||
      !jti ||
      !expiresAt ||
      !sign
    ) throw new MissingFieldsException();
    if (!authService.isDownloadUrlValid(userId, jti, expiresAt, sign)) throw new InvalidTokenException();

    next();
  }