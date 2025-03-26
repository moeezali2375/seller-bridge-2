import { eq } from "drizzle-orm";
import db from "../config/db";
import { buyers } from "../schemas/buyer-schema";
import { emailVerifications, users } from "../schemas/user-schema";
import {
  generateExpiryTime,
  generateVerificationToken,
} from "../utils/verificationToken";

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

export const registerBuyer = async (
  name: string,
  email: string,
  password: string,
) => {
  const user = await db.transaction(async (tx) => {
    const user = await tx
      .insert(users)
      .values({ name, email, password })
      .returning();

    await tx.insert(emailVerifications).values({
      id: user[0].id,
      token: generateVerificationToken(),
      expiresAt: generateExpiryTime(300),
    });

    await tx.insert(buyers).values({ id: user[0].id });
    return user[0];
  });

  return user;
};
