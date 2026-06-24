import { AuthService } from "@/services";
import { Request, Response, NextFunction } from "express";

export const checkValidationToken = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const validationResult = await authService.isValidationTokenLegit(token);

    if (!validationResult.valid) {
      if (validationResult.cause === 'token expired') await authService.updateStateByExpiredToken(token);
      return res.render('errors', { message: validationResult.cause, token });
    }
    next();
  }
}