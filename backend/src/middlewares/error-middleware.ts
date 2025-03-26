import { NextFunction, Request, Response } from "express";
import { devErrors, prodErrors } from "../controllers/error-controller";
import "dotenv/config";

const errorMiddleware = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    prodErrors(res, error);
  }
};

export default errorMiddleware;
