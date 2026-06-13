CREATE TYPE "public"."user_role" AS ENUM('user', 'agency', 'admin');--> statement-breakpoint
CREATE TYPE "public"."deposit_method" AS ENUM('momo', 'bank_transfer', 'card');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'spend', 'refund');--> statement-breakpoint
CREATE TYPE "public"."campaign_objective" AS ENUM('awareness', 'engagement', 'traffic', 'leads', 'sales');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('facebook', 'instagram', 'tiktok', 'google', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('deposit', 'campaign_launched', 'campaign_paused', 'campaign_completed', 'credits_deducted', 'refund');--> statement-breakpoint
CREATE TYPE "public"."social_account_status" AS ENUM('connected', 'expired', 'error');--> statement-breakpoint
CREATE TYPE "public"."ad_platform" AS ENUM('facebook', 'instagram', 'tiktok', 'google', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."card_purpose" AS ENUM('facebook_ads', 'instagram_ads', 'tiktok_ads', 'google_ads', 'youtube_ads', 'general');--> statement-breakpoint
CREATE TYPE "public"."kora_card_status" AS ENUM('active', 'frozen', 'closed');--> statement-breakpoint
CREATE TYPE "public"."kora_deposit_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"supabase_uid" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"business_name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_supabase_uid_unique" UNIQUE("supabase_uid")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"credits" numeric(18, 2),
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"reference" text,
	"method" "deposit_method",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"credit_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_deposited" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_spent" numeric(18, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"platform" "platform" NOT NULL,
	"objective" "campaign_objective" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"daily_budget" numeric(18, 2) NOT NULL,
	"total_budget" numeric(18, 2) NOT NULL,
	"credits_used" numeric(18, 2) DEFAULT '0' NOT NULL,
	"impressions" integer,
	"clicks" integer,
	"conversions" integer,
	"reach" integer,
	"headline" text,
	"description" text,
	"target_location" text,
	"target_age" text,
	"target_gender" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"launched_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "activity_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(18, 2),
	"campaign_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"account_name" text NOT NULL,
	"account_handle" text NOT NULL,
	"avatar_url" text,
	"followers" integer DEFAULT 0 NOT NULL,
	"status" "social_account_status" DEFAULT 'connected' NOT NULL,
	"connected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"scopes" text,
	"platform_user_id" text,
	"platform_username" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_ad_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"ad_platform" "ad_platform" NOT NULL,
	"ad_account_id" text NOT NULL,
	"ad_account_name" text NOT NULL,
	"status" text DEFAULT 'added' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kora_deposits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	"kora_reference" text NOT NULL,
	"amount_local" numeric(18, 2) NOT NULL,
	"local_currency" text DEFAULT 'GHS' NOT NULL,
	"amount_usd" numeric(18, 2),
	"exchange_rate" numeric(14, 6),
	"fee" numeric(18, 2) DEFAULT '0' NOT NULL,
	"adwallet_fee" numeric(18, 2) DEFAULT '0' NOT NULL,
	"status" "kora_deposit_status" DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"provider" text,
	"phone" text,
	"email" text,
	"authorization_url" text,
	"kora_response_raw" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kora_deposits_kora_reference_unique" UNIQUE("kora_reference")
);
--> statement-breakpoint
CREATE TABLE "kora_virtual_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	"kora_card_id" text NOT NULL,
	"card_number_enc" text NOT NULL,
	"expiry_enc" text NOT NULL,
	"cvv_enc" text NOT NULL,
	"card_number_last4" text NOT NULL,
	"cardholder_name" text NOT NULL,
	"status" "kora_card_status" DEFAULT 'active' NOT NULL,
	"balance_usd" numeric(18, 2) DEFAULT '0' NOT NULL,
	"spending_limit" numeric(18, 2) NOT NULL,
	"purpose" "card_purpose" DEFAULT 'general' NOT NULL,
	"last_balance_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kora_virtual_cards_kora_card_id_unique" UNIQUE("kora_card_id")
);
--> statement-breakpoint
CREATE TABLE "kora_webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"reference" text,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"payload_raw" text,
	CONSTRAINT "kora_webhooks_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_ad_accounts" ADD CONSTRAINT "card_ad_accounts_card_id_kora_virtual_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."kora_virtual_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_ad_accounts" ADD CONSTRAINT "card_ad_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kora_deposits" ADD CONSTRAINT "kora_deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kora_deposits" ADD CONSTRAINT "kora_deposits_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kora_virtual_cards" ADD CONSTRAINT "kora_virtual_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kora_virtual_cards" ADD CONSTRAINT "kora_virtual_cards_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_tokens_user_platform_idx" ON "oauth_tokens" USING btree ("user_id","platform");