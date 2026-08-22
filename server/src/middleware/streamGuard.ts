import { InvalidTokenException, MissingFieldsException } from "@/errors/ServerError";
import { hashData } from "@/helpers";
import { Request, Response, NextFunction } from "express"
export const streamGuard = (req: Request, res: Response, next: NextFunction) => {

  const { userId, songId, provider, expiresAt, sign } = req.query;
  if (!songId ||
    !provider ||
    !userId ||
    !expiresAt ||
    !sign
    ||
    typeof songId !== 'string' ||
    typeof provider !== 'string' ||
    typeof userId !== 'string' ||
    typeof expiresAt !== 'string' ||
    typeof sign !== 'string'

  ) throw new MissingFieldsException();


  if (Date.now() > Number(expiresAt)) throw new InvalidTokenException();
  const dataToSign = `${songId}:${provider}:${userId}:${expiresAt}`;
  const expectedSignature = hashData(dataToSign);

  if (expectedSignature !== sign) throw new InvalidTokenException();

  next();

}