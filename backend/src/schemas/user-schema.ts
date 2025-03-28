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
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const emailVerifications = pgTable("email_verifications", {
  id: serial("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  token: char("token", { length: 6 }).notNull(),
  retryCounter: integer("retry_counter").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
