import { InvalidTokenException, MissingFieldsException } from "@/errors/ServerError";
import { AuthService } from "@/services";
import { Request, Response, NextFunction } from "express"

export const createStreamGuard = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userId, songId, provider, expiresAt, sign } = req.query as { userId: string, songId: string, provider: string, expiresAt: string, sign: string };
    if (!songId ||
      !provider ||
      !userId ||
      !expiresAt ||
      !sign
    ) throw new MissingFieldsException();

    if (!authService.isSignedUrlValid(songId, provider, userId, expiresAt, sign)) throw new InvalidTokenException();

    next();
  }
}