-- Supabase Migration: Adswallet Schema
-- Generated from drizzle-orm schema

-- Enable UUID extension for Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────────────────────────

CREATE TYPE "user_role" AS ENUM ('user', 'agency', 'admin');
CREATE TYPE "platform" AS ENUM ('facebook', 'instagram', 'tiktok', 'google', 'youtube');
CREATE TYPE "campaign_objective" AS ENUM ('awareness', 'engagement', 'traffic', 'leads', 'sales');
CREATE TYPE "campaign_status" AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE "transaction_type" AS ENUM ('deposit', 'spend', 'refund');
CREATE TYPE "transaction_status" AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE "deposit_method" AS ENUM ('momo', 'bank_transfer', 'card');
CREATE TYPE "activity_type" AS ENUM ('deposit', 'campaign_launched', 'campaign_paused', 'campaign_completed', 'credits_deducted', 'refund');
CREATE TYPE "social_account_status" AS ENUM ('connected', 'expired', 'error');
CREATE TYPE "kora_deposit_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE "kora_card_status" AS ENUM ('active', 'frozen', 'closed');
CREATE TYPE "ad_platform" AS ENUM ('facebook', 'instagram', 'tiktok', 'google', 'youtube');
CREATE TYPE "card_purpose" AS ENUM ('facebook_ads', 'instagram_ads', 'tiktok_ads', 'google_ads', 'youtube_ads', 'general');

-- ── Users ────────────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT,
  "supabase_uid" TEXT UNIQUE,
  "role" "user_role" NOT NULL DEFAULT 'user',
  "business_name" TEXT,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Wallets ─────────────────────────────────────────────────────────────────────

CREATE TABLE "wallets" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "credit_balance" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "total_deposited" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "total_spent" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "currency" TEXT NOT NULL DEFAULT 'GHS',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Transactions ────────────────────────────────────────────────────────────────

CREATE TABLE "transactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "wallet_id" INTEGER NOT NULL REFERENCES "wallets"("id"),
  "type" "transaction_type" NOT NULL,
  "amount" NUMERIC(18, 2) NOT NULL,
  "credits" NUMERIC(18, 2),
  "status" "transaction_status" NOT NULL DEFAULT 'pending',
  "description" TEXT,
  "reference" TEXT,
  "method" "deposit_method",
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Campaigns ──────────────────────────────────────────────────────────────────

CREATE TABLE "campaigns" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "name" TEXT NOT NULL,
  "platform" "platform" NOT NULL,
  "objective" "campaign_objective" NOT NULL,
  "status" "campaign_status" NOT NULL DEFAULT 'draft',
  "daily_budget" NUMERIC(18, 2) NOT NULL,
  "total_budget" NUMERIC(18, 2) NOT NULL,
  "credits_used" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "impressions" INTEGER,
  "clicks" INTEGER,
  "conversions" INTEGER,
  "reach" INTEGER,
  "headline" TEXT,
  "description" TEXT,
  "target_location" TEXT,
  "target_age" TEXT,
  "target_gender" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "launched_at" TIMESTAMP
);

-- ── Activity ────────────────────────────────────────────────────────────────────

CREATE TABLE "activity" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "type" "activity_type" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" NUMERIC(18, 2),
  "campaign_id" INTEGER REFERENCES "campaigns"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Social Accounts ────────────────────────────────────────────────────────────

CREATE TABLE "social_accounts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "platform" "platform" NOT NULL,
  "account_name" TEXT NOT NULL,
  "account_handle" TEXT NOT NULL,
  "avatar_url" TEXT,
  "followers" INTEGER NOT NULL DEFAULT 0,
  "status" "social_account_status" NOT NULL DEFAULT 'connected',
  "connected_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── OAuth Tokens ────────────────────────────────────────────────────────────────

CREATE TABLE "oauth_tokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "platform" "platform" NOT NULL,
  "access_token" TEXT NOT NULL,
  "refresh_token" TEXT,
  "expires_at" TIMESTAMP,
  "scopes" TEXT,
  "platform_user_id" TEXT,
  "platform_username" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "oauth_tokens_user_platform_idx" ON "oauth_tokens"("user_id", "platform");

-- ── Kora Deposits ───────────────────────────────────────────────────────────────

CREATE TABLE "kora_deposits" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "wallet_id" INTEGER NOT NULL REFERENCES "wallets"("id"),
  "kora_reference" TEXT NOT NULL UNIQUE,
  "amount_local" NUMERIC(18, 2) NOT NULL,
  "local_currency" TEXT NOT NULL DEFAULT 'GHS',
  "amount_usd" NUMERIC(18, 2),
  "exchange_rate" NUMERIC(14, 6),
  "fee" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "adwallet_fee" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "status" "kora_deposit_status" NOT NULL DEFAULT 'pending',
  "payment_method" TEXT NOT NULL,
  "provider" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "authorization_url" TEXT,
  "kora_response_raw" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Kora Virtual Cards ─────────────────────────────────────────────────────────

CREATE TABLE "kora_virtual_cards" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "wallet_id" INTEGER NOT NULL REFERENCES "wallets"("id"),
  "kora_card_id" TEXT NOT NULL UNIQUE,
  "card_number_enc" TEXT NOT NULL,
  "expiry_enc" TEXT NOT NULL,
  "cvv_enc" TEXT NOT NULL,
  "card_number_last4" TEXT NOT NULL,
  "cardholder_name" TEXT NOT NULL,
  "status" "kora_card_status" NOT NULL DEFAULT 'active',
  "balance_usd" NUMERIC(18, 2) NOT NULL DEFAULT '0',
  "spending_limit" NUMERIC(18, 2) NOT NULL,
  "purpose" "card_purpose" NOT NULL DEFAULT 'general',
  "last_balance_sync_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Card Ad Accounts ────────────────────────────────────────────────────────────

CREATE TABLE "card_ad_accounts" (
  "id" SERIAL PRIMARY KEY,
  "card_id" INTEGER NOT NULL REFERENCES "kora_virtual_cards"("id"),
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "ad_platform" "ad_platform" NOT NULL,
  "ad_account_id" TEXT NOT NULL,
  "ad_account_name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'added',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Kora Webhooks ───────────────────────────────────────────────────────────────

CREATE TABLE "kora_webhooks" (
  "id" SERIAL PRIMARY KEY,
  "event_id" TEXT NOT NULL UNIQUE,
  "event_type" TEXT NOT NULL,
  "reference" TEXT,
  "processed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "payload_raw" TEXT
);

-- ── Row Level Security (RLS) ────────────────────────────────────────────────────
-- Enable RLS for security

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kora_deposits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kora_virtual_cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "card_ad_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kora_webhooks" ENABLE ROW LEVEL SECURITY;

-- ── Indexes ─────────────────────────────────────────────────────────────────────

CREATE INDEX "idx_wallets_user_id" ON "wallets"("user_id");
CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id");
CREATE INDEX "idx_transactions_wallet_id" ON "transactions"("wallet_id");
CREATE INDEX "idx_campaigns_user_id" ON "campaigns"("user_id");
CREATE INDEX "idx_activity_user_id" ON "activity"("user_id");
CREATE INDEX "idx_activity_campaign_id" ON "activity"("campaign_id");
CREATE INDEX "idx_social_accounts_user_id" ON "social_accounts"("user_id");
CREATE INDEX "idx_kora_deposits_user_id" ON "kora_deposits"("user_id");
CREATE INDEX "idx_kora_deposits_wallet_id" ON "kora_deposits"("wallet_id");
CREATE INDEX "idx_kora_deposits_status" ON "kora_deposits"("status");
CREATE INDEX "idx_kora_virtual_cards_user_id" ON "kora_virtual_cards"("user_id");
CREATE INDEX "idx_card_ad_accounts_card_id" ON "card_ad_accounts"("card_id");
CREATE INDEX "idx_card_ad_accounts_user_id" ON "card_ad_accounts"("user_id");
