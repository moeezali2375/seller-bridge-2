import { and, eq, gt, lte } from "drizzle-orm";
import db from "../config/db";
import { buyers } from "../schemas/buyer-schema";
import { emailVerifications, users } from "../schemas/user-schema";
import CustomError from "../utils/customError";
import {
  generateExpiryTime,
  generateVerificationToken,
  comparePasswords,
  hashPassword,
} from "../utils/authUtils";
import { userBuyer, userSeller } from "../types/auth";

const generateExpiryTimeForEmailVerifications = () => generateExpiryTime(300);

export const getBuyerByIdService = async (userId: number) => {
  const buyer = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isVerified: users.isVerified,
      subscriptionStatus: buyers.subscriptionStatus,
    })
    .from(users)
    .innerJoin(buyers, eq(users.id, buyers.id))
    .where(and(eq(users.id, userId), eq(users.role, "buyer")));
  if (!buyer || buyer.length === 0)
    throw new CustomError("User not found! 🧑🏻‍💻", 400);
  return buyer[0];
};

export const findUserByEmailService = async (email: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user.length ? user[0] : null;
};

export const deleteUserByIdService = async (id: number) => {
  const result = await db.delete(users).where(eq(users.id, id)).returning();
  return result.length > 0;
};

export const getUserVerificationDetailsService = async (id: number) => {
  const result = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.id, id))
    .limit(1);
  return result.length ? result[0] : null;
};

export const createBuyerService = async (
  name: string,
  email: string,
  password: string,
) => {
  const hashedPassword = await hashPassword(password);
  try {
    const { user, verificationToken } = await db.transaction(async (tx) => {
      const newUser = await tx
        .insert(users)
        .values({ name: name, email: email, password: hashedPassword })
        .returning();

      if (!newUser || newUser.length === 0) throw new CustomError("", 400);

      const newEmailVerification = await tx
        .insert(emailVerifications)
        .values({
          id: newUser[0].id,
          verificationToken: generateVerificationToken(),
          expiresAt: generateExpiryTimeForEmailVerifications(),
        })
        .returning();

      if (!newEmailVerification || newEmailVerification.length == 0)
        throw new CustomError("", 400);

      const newBuyer = await tx
        .insert(buyers)
        .values({ id: newUser[0].id })
        .returning();
      if (!newBuyer || newBuyer.length === 0) throw new CustomError("", 400);

      return {
        user: newUser[0],
        verificationToken: newEmailVerification[0].verificationToken,
      };
    });

    return { user, verificationToken };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new CustomError("User already exists. 🙁", 400);
  }
};

export const verifyVerificationTokenService = async (
  userId: number,
  verificationToken: string,
) => {
  const emailVerification = await db
    .select()
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.id, userId),
        gt(emailVerifications.expiresAt, new Date()),
      ),
    );

  if (!emailVerification || emailVerification.length === 0)
    throw new CustomError("Invalid or expired token. 😣", 400);

  if (verificationToken === emailVerification[0].verificationToken) {
    await db.transaction(async (tx) => {
      const updateResult = await tx
        .update(users)
        .set({ isVerified: true })
        .where(eq(users.id, userId))
        .execute();

      if (updateResult.rowCount === 0) {
        throw new CustomError("User verification failed. 😵", 400);
      }

      const deleteResult = await tx
        .delete(emailVerifications)
        .where(eq(emailVerifications.id, userId))
        .execute();

      if (deleteResult.rowCount === 0) {
        throw new CustomError("User verification failed. 😵", 400);
      }
    });
  } else throw new CustomError("Incorrect verification code ❌🔢", 400);
};

export const regenerateVerificationTokenService = async (userId: number) => {
  const emailVerification = await db
    .select()
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.id, userId),
        lte(emailVerifications.retryCounter, 3),
      ),
    );
  if (!emailVerification || emailVerification.length === 0)
    throw new CustomError("User already verified or does not exist ✅❌", 400);

  const updatedEmailVerification = await db
    .update(emailVerifications)
    .set({
      retryCounter: emailVerification[0].retryCounter + 1,
      verificationToken: generateVerificationToken(),
      expiresAt: generateExpiryTimeForEmailVerifications(),
    })
    .where(eq(emailVerifications.id, userId))
    .returning();
  if (!updatedEmailVerification || updatedEmailVerification.length == 0)
    throw new CustomError("User already verified or does not exist ✅❌", 400);
  return updatedEmailVerification[0].verificationToken;
};

export const loginService = async (
  email: string,
  password: string,
): Promise<userSeller | userBuyer | null> => {
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email)));

  if (!user || user.length === 0)
    throw new CustomError("User does not exist ❌🚫", 400);

  if (!(await comparePasswords(password, user[0].password)))
    throw new CustomError("Incorrect Password ❌", 400);

  if (user[0].role === "buyer") {
    const userBuyer = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        subscriptionStatus: buyers.subscriptionStatus,
      })
      .from(users)
      .innerJoin(buyers, eq(users.id, buyers.id))
      .where(eq(users.id, user[0].id));
    if (!userBuyer || userBuyer.length === 0)
      throw new CustomError("User not found ❌", 400);
    return userBuyer[0];
  } else {
    // TODO:
  }
  return null;
};
