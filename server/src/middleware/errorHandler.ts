import { ServerError } from "@/errors/ServerError";
import { NextFunction, Request, Response } from "express";

export function errorHandler(err: Error, req: Request, res: Response, _: NextFunction) {
  if (err instanceof ServerError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Server error' });
}