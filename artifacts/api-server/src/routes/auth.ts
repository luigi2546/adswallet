import { Router } from "express";
import { db, usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, requireAuth } from "../lib/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

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

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, email, password, businessName } = parsed.data;
  const countryCode = typeof req.body.country === "string" ? req.body.country.toUpperCase() : "";
  const currency = COUNTRY_CURRENCY[countryCode] ?? "GHS";

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    businessName: businessName ?? null,
    role: "user",
  }).returning();

  await db.insert(walletsTable).values({
    userId: user.id,
    creditBalance: "0",
    totalDeposited: "0",
    totalSpent: "0",
    currency,
  });

  const token = generateToken(user.id);
  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName ?? null,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName ?? null,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessName: user.businessName ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", requireAuth, async (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
