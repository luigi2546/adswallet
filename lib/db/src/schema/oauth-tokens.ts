import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { platformEnum } from "./campaigns";

export const oauthTokensTable = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  platform: platformEnum("platform").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scopes: text("scopes"),
  platformUserId: text("platform_user_id"),
  platformUsername: text("platform_username"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("oauth_tokens_user_platform_idx").on(t.userId, t.platform),
]);

export type OauthToken = typeof oauthTokensTable.$inferSelect;
export type InsertOauthToken = typeof oauthTokensTable.$inferInsert;
