import { pgTable, serial, integer, numeric, text, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";
import { walletsTable } from "./wallets";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const koraDepositStatusEnum = pgEnum("kora_deposit_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const koraCardStatusEnum = pgEnum("kora_card_status", [
  "active",
  "frozen",
  "closed",
]);

export const adPlatformEnum = pgEnum("ad_platform", [
  "facebook",
  "instagram",
  "tiktok",
  "google",
  "youtube",
]);

export const cardPurposeEnum = pgEnum("card_purpose", [
  "facebook_ads",
  "instagram_ads",
  "tiktok_ads",
  "google_ads",
  "youtube_ads",
  "general",
]);

// ── Kora Deposits ──────────────────────────────────────────────────────────────

export const koraDepositsTable = pgTable("kora_deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  walletId: integer("wallet_id").notNull().references(() => walletsTable.id),
  koraReference: text("kora_reference").notNull().unique(),
  amountLocal: numeric("amount_local", { precision: 18, scale: 2 }).notNull(),
  localCurrency: text("local_currency").notNull().default("GHS"),
  amountUsd: numeric("amount_usd", { precision: 18, scale: 2 }),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }),
  fee: numeric("fee", { precision: 18, scale: 2 }).notNull().default("0"),
  adwalletFee: numeric("adwallet_fee", { precision: 18, scale: 2 }).notNull().default("0"),
  status: koraDepositStatusEnum("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(), // mobile_money, bank_transfer, card
  provider: text("provider"), // MTN, Airtel, Vodafone, Safaricom
  phone: text("phone"),
  email: text("email"),
  authorizationUrl: text("authorization_url"),
  koraResponseRaw: text("kora_response_raw"), // JSON stringified (no sensitive data)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Kora Virtual Cards ─────────────────────────────────────────────────────────

export const koraVirtualCardsTable = pgTable("kora_virtual_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  walletId: integer("wallet_id").notNull().references(() => walletsTable.id),
  koraCardId: text("kora_card_id").notNull().unique(),
  cardNumberEnc: text("card_number_enc").notNull(), // AES-256-GCM encrypted
  expiryEnc: text("expiry_enc").notNull(),          // AES-256-GCM encrypted
  cvvEnc: text("cvv_enc").notNull(),                // AES-256-GCM encrypted
  cardNumberLast4: text("card_number_last4").notNull(), // e.g. "1111"
  cardholderName: text("cardholder_name").notNull(),
  status: koraCardStatusEnum("status").notNull().default("active"),
  balanceUsd: numeric("balance_usd", { precision: 18, scale: 2 }).notNull().default("0"),
  spendingLimit: numeric("spending_limit", { precision: 18, scale: 2 }).notNull(),
  purpose: cardPurposeEnum("purpose").notNull().default("general"),
  lastBalanceSyncAt: timestamp("last_balance_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Card ↔ Ad Account Links ────────────────────────────────────────────────────

export const cardAdAccountsTable = pgTable("card_ad_accounts", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull().references(() => koraVirtualCardsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  adPlatform: adPlatformEnum("ad_platform").notNull(),
  adAccountId: text("ad_account_id").notNull(),
  adAccountName: text("ad_account_name").notNull(),
  status: text("status").notNull().default("added"), // added, active, suspended
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Kora Webhook Idempotency Log ───────────────────────────────────────────────

export const koraWebhooksTable = pgTable("kora_webhooks", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().unique(), // Kora's event ID for idempotency
  eventType: text("event_type").notNull(),
  reference: text("reference"),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
  payloadRaw: text("payload_raw"), // JSON stringified (no sensitive data)
});

// ── Zod Schemas & Types ────────────────────────────────────────────────────────

export const insertKoraDepositSchema = createInsertSchema(koraDepositsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKoraDeposit = z.infer<typeof insertKoraDepositSchema>;
export type KoraDeposit = typeof koraDepositsTable.$inferSelect;

export const insertKoraVirtualCardSchema = createInsertSchema(koraVirtualCardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKoraVirtualCard = z.infer<typeof insertKoraVirtualCardSchema>;
export type KoraVirtualCard = typeof koraVirtualCardsTable.$inferSelect;

export const insertCardAdAccountSchema = createInsertSchema(cardAdAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCardAdAccount = z.infer<typeof insertCardAdAccountSchema>;
export type CardAdAccount = typeof cardAdAccountsTable.$inferSelect;

export const insertKoraWebhookSchema = createInsertSchema(koraWebhooksTable).omit({ id: true, processedAt: true });
export type InsertKoraWebhook = z.infer<typeof insertKoraWebhookSchema>;
export type KoraWebhook = typeof koraWebhooksTable.$inferSelect;
