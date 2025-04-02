import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  char,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("buyer"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const emailVerifications = pgTable("email_verifications", {
  id: serial("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  verificationToken: char("verification_token", { length: 6 }).notNull(),
  retryCounter: integer("retry_counter").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const resetPasswordVerifications = pgTable(
  "reset_password_verifications",
  {
    id: serial("id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    verificationToken: text("verification_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);
