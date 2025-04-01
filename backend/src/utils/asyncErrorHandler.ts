import { NextFunction, Response, Request } from "express";
import { AsyncRouteHandler } from "../types/handlers";
import CustomError from "./customError";

const asyncErrorHandler = (func: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err: CustomError) => next(err));
  };
};

export default asyncErrorHandler;
