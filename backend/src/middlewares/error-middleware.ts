import { NextFunction, Request, Response } from "express";
import { devErrors, prodErrors } from "../controllers/error-controller";
import CustomError from "../utils/customError";
import { config } from "../config/config";
const NODE_ENV = config.NODE_ENV;

const errorMiddleware = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (NODE_ENV === "development") {
    devErrors(res, error);
  } else if (NODE_ENV === "production") {
    prodErrors(res, error);
  }
};

export default errorMiddleware;
