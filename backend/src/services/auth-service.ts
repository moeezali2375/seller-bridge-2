import { eq } from "drizzle-orm";
import db from "../config/db";
import { buyers } from "../schemas/buyer-schema";
import { emailVerifications, users } from "../schemas/user-schema";
import {
  generateExpiryTime,
  generateVerificationToken,
} from "../utils/verificationToken";
import { hashPassword } from "../utils/password";
import CustomError from "../utils/customError";
// import CustomError from "../utils/customError";

const generateExpiryTimeForEmailVerifications = () => generateExpiryTime(300);

export const findUserByEmail = async (email: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user.length ? user[0] : null;
};

export const deleteUserById = async (id: number) => {
  const result = await db.delete(users).where(eq(users.id, id)).returning();
  return result.length > 0;
};

export const getUserVerificationDetails = async (id: number) => {
  const result = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.id, id))
    .limit(1);
  return result.length ? result[0] : null;
};

export const createBuyer = async (
  name: string,
  email: string,
  password: string,
) => {
  const hashedPassword = await hashPassword(password);
  try {
    const user = await db.transaction(async (tx) => {
      const newUser = await tx
        .insert(users)
        .values({ name: name, email: email, password: hashedPassword })
        .returning();

      await tx.insert(emailVerifications).values({
        id: newUser[0].id,
        token: generateVerificationToken(),
        expiresAt: generateExpiryTimeForEmailVerifications(),
      });

      await tx.insert(buyers).values({ id: newUser[0].id });
      return newUser[0];
    });

    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new CustomError("User already exists. 🙁", 400);
  }
};
