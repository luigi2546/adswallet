import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import {
  db,
  usersTable,
  walletsTable,
  organizationsTable,
  organizationMembersTable,
  type User,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { supabase } from "./supabase.service";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "adwallet-secret-key";

// Legacy password hashing for backward compatibility / seeding
export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

// Legacy token generation for backward compatibility
export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

// Legacy token verification for backward compatibility
export function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, ts, sig] = parts;
    const payload = `${userId}:${ts}`;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    return parseInt(userId, 10);
  } catch {
    return null;
  }
}

const COUNTRY_CURRENCY: Record<string, string> = {
  GH: "GHS", NG: "NGN", KE: "KES", ZA: "ZAR", UG: "UGX",
  TZ: "TZS", RW: "RWF", ET: "ETB", EG: "EGP", MA: "MAD",
  TN: "TND", DZ: "DZD", SN: "XOF", CI: "XOF", CM: "XAF",
  ML: "XOF", BF: "XOF", NE: "XOF", TD: "XAF", GA: "XAF",
  CG: "XAF", CD: "CDF", AO: "AOA", MZ: "MZN", ZM: "ZMW",
  ZW: "USD", BW: "BWP", NA: "NAD", LS: "LSL", SZ: "SZL",
  MW: "MWK", MG: "MGA", MU: "MUR", SC: "SCR", SS: "SSP",
  SD: "SDG", SO: "SOS", DJ: "DJF", ER: "ERN", SL: "SLL",
  LR: "LRD", GN: "GNF", GM: "GMD", GW: "XOF", CV: "CVE",
  ST: "STN", KM: "KMF", GQ: "XAF", CF: "XAF", BI: "BIF",
  MR: "MRU", TG: "XOF", BJ: "XOF", LY: "LYD",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "organization";
}

async function ensureWalletForOrganization(user: User, organizationId: number, currency: string): Promise<void> {
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(and(eq(walletsTable.userId, user.id), eq(walletsTable.organizationId, organizationId)))
    .limit(1);

  if (!wallet) {
    await db.insert(walletsTable).values({
      userId: user.id,
      organizationId,
      creditBalance: "0",
      totalDeposited: "0",
      totalSpent: "0",
      currency,
    });
  }
}

export async function ensureDefaultOrganizationForUser(user: User, currency = "GHS") {
  const [membership] = await db
    .select()
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, user.id))
    .limit(1);

  if (membership) {
    const [organization] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, membership.organizationId))
      .limit(1);

    if (organization) {
      await ensureWalletForOrganization(user, organization.id, currency);
      return organization;
    }
  }

  const baseName = user.businessName ?? `${user.name}'s Organization`;
  const baseSlug = slugify(user.businessName ?? user.name);
  const slug = `${baseSlug}-${user.id}`;

  const [organization] = await db
    .insert(organizationsTable)
    .values({
      name: baseName,
      slug,
      ownerUserId: user.id,
    })
    .returning();

  await db.insert(organizationMembersTable).values({
    organizationId: organization.id,
    userId: user.id,
    role: "owner",
  });

  await ensureWalletForOrganization(user, organization.id, currency);
  return organization;
}

async function resolveActiveOrganization(req: Request, user: User, currency = "GHS") {
  const requestedOrganizationId = Number(req.headers["x-organization-id"]);

  if (Number.isInteger(requestedOrganizationId) && requestedOrganizationId > 0) {
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.userId, user.id),
          eq(organizationMembersTable.organizationId, requestedOrganizationId),
        ),
      )
      .limit(1);

    if (membership) {
      const [organization] = await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, membership.organizationId))
        .limit(1);

      if (organization) {
        await ensureWalletForOrganization(user, organization.id, currency);
        return organization;
      }
    }
  }

  return ensureDefaultOrganizationForUser(user, currency);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);

  try {
    // 1. Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    if (error || !supabaseUser) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // 2. Fetch local user by supabaseUid
    let [user] = await db.select().from(usersTable).where(eq(usersTable.supabaseUid, supabaseUser.id)).limit(1);

    // 3. Lazy provision if user exists in Supabase but not yet in our PostgreSQL profile tables
    if (!user) {
      const email = supabaseUser.email ?? "";
      const name = supabaseUser.user_metadata?.name || email.split("@")[0] || "User";
      const businessName = supabaseUser.user_metadata?.businessName || null;
      const country = supabaseUser.user_metadata?.country || "GH";
      const currency = COUNTRY_CURRENCY[country.toUpperCase()] ?? "GHS";

      const [newUser] = await db.insert(usersTable).values({
        name,
        email,
        supabaseUid: supabaseUser.id,
        businessName,
        role: "user",
      }).returning();

      user = newUser;

      await ensureDefaultOrganizationForUser(user, currency);
    }

    const country = supabaseUser.user_metadata?.country || "GH";
    const currency = COUNTRY_CURRENCY[country.toUpperCase()] ?? "GHS";
    const organization = await resolveActiveOrganization(req, user, currency);

    (req as any).user = user;
    (req as any).organization = organization;
    next();
  } catch (err: any) {
    req.log?.error({ err }, "Authentication middleware error");
    res.status(401).json({ error: "Authentication failed" });
  }
}
