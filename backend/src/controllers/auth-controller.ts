import { NextFunction, Request, Response } from "express";
import {
  createBuyer,
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
    return next(err);
  }

  const userExists = await findUserByEmail(email);

  if (userExists?.isVerified === true) {
    return next(new CustomError("User already exists. 🙁", 400));
  } else if (userExists) {
    const userVerification = await getUserVerificationDetails(userExists.id);
    const now = new Date();
    if (userVerification && userVerification.expiresAt > now)
      return next(new CustomError("User already exists. 🙁", 400));
    else {
      // INFO: If user's verfication time has expired
      await deleteUserById(userExists.id);
    }
  }
  // TODO: registerBuyer
  const newUser = await createBuyer(name, email, password);
  res.status(200).json({
    status: "ok",
    message: "User Created Successfully! 🎉✅",
    user: newUser,
  });
};
