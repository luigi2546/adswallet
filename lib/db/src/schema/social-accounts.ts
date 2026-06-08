import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { platformEnum } from "./campaigns";

export const socialAccountStatusEnum = pgEnum("social_account_status", ["connected", "expired", "error"]);

export const socialAccountsTable = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  platform: platformEnum("platform").notNull(),
  accountName: text("account_name").notNull(),
  accountHandle: text("account_handle").notNull(),
  avatarUrl: text("avatar_url"),
  followers: integer("followers").notNull().default(0),
  status: socialAccountStatusEnum("status").notNull().default("connected"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
});

export type SocialAccount = typeof socialAccountsTable.$inferSelect;
export type InsertSocialAccount = typeof socialAccountsTable.$inferInsert;
