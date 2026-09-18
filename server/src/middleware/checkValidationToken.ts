import { render } from "@/helpers";
import { ActivationService } from "@/services/ActivationService";
import { Request, Response, NextFunction } from "express";

export const checkValidationToken = (activationService: ActivationService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token || req.body.token;
    const validationResult = await activationService.isValidationTokenLegit(token);


    if (!validationResult.valid) {
      console.warn('token failed: ', validationResult.cause);
      if (validationResult.cause === 'token expired') {
        await activationService.updateStateByExpiredToken(token);
        render(res, 'msg', {
          message: 'Invitation expired',
          title: 'Invitation expired',

          form: {
            action: '/request-new-link',
            text: 'This invitation has expired',
            submitText: 'Request a new invitation',
            token,
          }
        })
      } else {
        render(res, 'msg', {
          message: validationResult.cause,
          title: 'Error',
        });
      }
    } else next();
  }
}