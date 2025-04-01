import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import CustomError from "./customError";
import crypto from "crypto";

export const generateVerificationToken = () =>
  crypto.randomInt(100000, 999999).toString();

//time in seconds, i.e. 300 for 5 mins
export const generateExpiryTime = (time: number) =>
  new Date(Date.now() + time * 1000);

export const generateJwtToken = (
  id: number,
  rememberMe: boolean = false,
): string => {
  if (rememberMe)
    return jwt.sign({ id }, config.JWT_SECRET, {
      expiresIn: "30d",
    });
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyJwtToken = (token: string) => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as { id: string };
  } catch (error) {
    if (error instanceof Error) throw new CustomError("Invalid token! 🧑🏻‍💻", 400);
    throw error;
  }
};

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePasswords(
  plainPassword: string,
  encryptedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, encryptedPassword);
}
