import { InvalidTokenException } from "@/errors/ServerError";
import { AuthService } from "@/services";
import { NextFunction, Request, Response } from "express";

export const checkResetPasswordToken = (authService: AuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token || req.body.token;
    console.log('ward', token);
    const uuidRegex = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) throw new InvalidTokenException();

    const isTokenValid = await authService.isResetPasswordTokenValid(token);

    if (!isTokenValid) {
      throw new InvalidTokenException();
    }
    next();
  }