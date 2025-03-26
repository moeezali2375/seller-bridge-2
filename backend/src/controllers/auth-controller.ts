import { NextFunction, Request, Response } from "express";
import {
  deleteUserById,
  findUserByEmail,
  getUserVerificationDetails,
} from "../services/auth-service";
import CustomError from "../utils/customError";

export const registerBuyer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    const err = new CustomError(
      "📧 email, 📛 name, or 🔑 password not sent!",
      400,
    );
    next(err);
  }

  const userExists = await findUserByEmail(email);

  if (userExists?.isVerified === true) {
    next(new CustomError("User already exists. 🙁", 400));
  } else if (userExists) {
    const userVerification = await getUserVerificationDetails(userExists.id);
    const now = new Date();
    if (userVerification?.expiresAt > now)
      next(new CustomError("User already exists. 🙁", 400));
    else {
      await deleteUserById(userExists.id);
    }
  }
};
