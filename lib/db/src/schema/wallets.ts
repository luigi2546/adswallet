import { pgTable, serial, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "spend", "refund"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);
export const depositMethodEnum = pgEnum("deposit_method", ["momo", "bank_transfer", "card"]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  creditBalance: numeric("credit_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  totalDeposited: numeric("total_deposited", { precision: 18, scale: 2 }).notNull().default("0"),
  totalSpent: numeric("total_spent", { precision: 18, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("GHS"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  walletId: integer("wallet_id").notNull().references(() => walletsTable.id),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  credits: numeric("credits", { precision: 18, scale: 2 }),
  status: transactionStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  reference: text("reference"),
  method: depositMethodEnum("method"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Wallet = typeof walletsTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
