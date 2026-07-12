import { ActivationService } from "@/services/ActivationService";
import { Request, Response, NextFunction } from "express";

export const checkValidationToken = (activationService: ActivationService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const validationResult = await activationService.isValidationTokenLegit(token);

    if (!validationResult.valid) {
      if (validationResult.cause === 'token expired') await activationService.updateStateByExpiredToken(token);
      return res.render('errors', { message: validationResult.cause, token });
    }
    next();
  }
}