import { Request, Response, NextFunction } from "express";

export type AsyncRouteHandler<T = unknown> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<T | void>;
