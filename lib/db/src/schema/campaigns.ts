import { pgTable, serial, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";

export const platformEnum = pgEnum("platform", ["facebook", "instagram", "tiktok", "google", "youtube"]);
export const campaignObjectiveEnum = pgEnum("campaign_objective", ["awareness", "engagement", "traffic", "leads", "sales"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed"]);

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  name: text("name").notNull(),
  platform: platformEnum("platform").notNull(),
  objective: campaignObjectiveEnum("objective").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  dailyBudget: numeric("daily_budget", { precision: 18, scale: 2 }).notNull(),
  totalBudget: numeric("total_budget", { precision: 18, scale: 2 }).notNull(),
  creditsUsed: numeric("credits_used", { precision: 18, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  conversions: integer("conversions"),
  reach: integer("reach"),
  headline: text("headline"),
  description: text("description"),
  targetLocation: text("target_location"),
  targetAge: text("target_age"),
  targetGender: text("target_gender"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  launchedAt: timestamp("launched_at"),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, createdAt: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
