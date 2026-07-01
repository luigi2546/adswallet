CREATE TYPE "public"."organization_member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "organization_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "organizations" ("name", "slug", "owner_user_id")
SELECT
	COALESCE(NULLIF("business_name", ''), "name" || '''s Organization'),
	'user-' || "id",
	"id"
FROM "users";
--> statement-breakpoint
INSERT INTO "organization_members" ("organization_id", "user_id", "role")
SELECT "id", "owner_user_id", 'owner'
FROM "organizations";
--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "wallets" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "wallets"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "transactions" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "transactions"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "campaigns" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "campaigns"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "activity" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "activity"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "social_accounts" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "social_accounts"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "social_accounts" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_tokens" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "oauth_tokens" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "oauth_tokens"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "oauth_tokens" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kora_deposits" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "kora_deposits" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "kora_deposits"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "kora_deposits" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kora_virtual_cards" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "kora_virtual_cards" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "kora_virtual_cards"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "kora_virtual_cards" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "card_ad_accounts" ADD COLUMN "organization_id" integer;--> statement-breakpoint
UPDATE "card_ad_accounts" SET "organization_id" = (
	SELECT "organization_id" FROM "organization_members"
	WHERE "organization_members"."user_id" = "card_ad_accounts"."user_id"
	ORDER BY "organization_members"."id" LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "card_ad_accounts" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kora_deposits" ADD CONSTRAINT "kora_deposits_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kora_virtual_cards" ADD CONSTRAINT "kora_virtual_cards_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_ad_accounts" ADD CONSTRAINT "card_ad_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_org_user_idx" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
DROP INDEX IF EXISTS "oauth_tokens_user_platform_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_tokens_org_platform_idx" ON "oauth_tokens" USING btree ("organization_id","platform");
