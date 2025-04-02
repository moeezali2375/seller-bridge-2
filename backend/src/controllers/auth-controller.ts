import { NextFunction, Request, Response } from "express";
import {
  createBuyerService,
  deleteUserByIdService,
  findUserByEmailService,
  getUserVerificationDetailsService,
  initiateResetPasswordService,
  loginService,
  regenerateVerificationTokenService,
  resetPasswordService,
  verifyVerificationTokenService,
} from "../services/auth-service";
import CustomError from "../utils/customError";
import { generateJwtToken } from "../utils/authUtils";
import {
  sendResetPasswordVerificationEmail,
  sendVerificationEmail,
} from "../services/email-service";

export const regenerateVerificationTokenController = async (
  req: Request,
  res: Response,
) => {
  if (req.user!.isVerified)
    throw new CustomError("User already verified! 🎉", 400);

  const newVerificationToken = await regenerateVerificationTokenService(
    req.user!.id,
  );

  // NOTE: no need to wait
  sendVerificationEmail(req.user!.email, req.user!.name, newVerificationToken);

  res.status(200).json({
    status: "ok",
    message: "New verification code sent ✅📩",
  });
};

export const verifyVerificationTokenController = async (
  req: Request,
  res: Response,
) => {
  const { verificationToken } = req.params;
  if (!verificationToken)
    throw new CustomError("Verification Token not sent! 🙁", 400);

  await verifyVerificationTokenService(req.user!.id, verificationToken);

  //TODO: setup email
  res
    .status(200)
    .json({ status: "ok", message: "Account verified successfully! 🥳" });
};

export const registerBuyerController = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    throw new CustomError("📧 email, 📛 name, or 🔑 password not sent!", 400);
  }

  const userExists = await findUserByEmailService(email);

  if (userExists?.isVerified === true) {
    throw new CustomError("User already exists. 🙁", 400);
  } else if (userExists) {
    const userVerification = await getUserVerificationDetailsService(
      userExists.id,
    );
    const now = new Date();
    if (userVerification && userVerification.expiresAt > now)
      throw new CustomError("User already exists. 🙁", 400);
    else {
      // INFO: If user's verfication time has expired
      await deleteUserByIdService(userExists.id);
    }
  }

  const { user, verificationToken } = await createBuyerService(
    name,
    email,
    password,
  );

  const jwtToken = generateJwtToken(user.id);

  // NOTE: no need to wait
  sendVerificationEmail(user.email, user.name, verificationToken);
  res.status(200).json({
    status: "ok",
    message: "User Created Successfully! 🎉✅",
    user,
    jwtToken,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const {
    email,
    password,
    rememberMe,
  }: { email: string; password: string; rememberMe?: boolean } = req.body;

  if (!email || !password)
    throw new CustomError("Email or password not sent ❌📧🔑", 400);

  const user = await loginService(email, password);

  const jwtToken = generateJwtToken(user!.id, rememberMe);

  res.status(200).json({
    status: "ok",
    message: "Login successfull! 🎉✅",
    user,
    jwtToken,
  });
};

export const initiateResetPasswordController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { email } = req.body;

  const user = await findUserByEmailService(email);

  if (!user)
    throw new CustomError("User does not exist in the database. 😛", 400);

  const resetPasswordVerification = await initiateResetPasswordService(user.id);

  sendResetPasswordVerificationEmail(
    email,
    user.name,
    resetPasswordVerification.verificationToken,
    "5",
  );

  res
    .status(200)
    .json({ status: "ok", message: "Password recovery request initiated! 🤨" });
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { email, verificationToken, newPassword } = req.body;

  await resetPasswordService(email, verificationToken, newPassword);

  res.status(200).json({ status: "ok", message: "Password recovered! 😎" });
};
