import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureDefaultOrganizationForUser, requireAuth } from "../lib/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { supabase } from "../lib/supabase.service";

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

  try {
    // 1. Check local DB if email is already taken
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // 2. Register user in Supabase via Admin Client
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to bypass email verification in dev
      user_metadata: { name, businessName, country: countryCode },
    });

    if (createError || !createData.user) {
      res.status(400).json({ error: createError?.message || "Failed to register user in Supabase" });
      return;
    }

    const supabaseUser = createData.user;

    // 3. Create user in local PostgreSQL
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      supabaseUid: supabaseUser.id,
      businessName: businessName ?? null,
      role: "user",
    }).returning();

    // 4. Create default tenant and wallet
    const organization = await ensureDefaultOrganizationForUser(user, currency);

    // 5. Sign in newly registered user via Supabase SDK to get JWT access token
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      res.status(400).json({ error: authError?.message || "Registered successfully, but failed to log in automatically" });
      return;
    }

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName ?? null,
        avatarUrl: user.avatarUrl ?? null,
        organizationId: organization.id,
        organizationName: organization.name,
        createdAt: user.createdAt.toISOString(),
      },
      token: authData.session.access_token,
    });
  } catch (err: any) {
    req.log?.error({ err }, "Registration error");
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  try {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      res.status(401).json({ error: authError?.message || "Invalid credentials" });
      return;
    }

    const supabaseUser = authData.user;

    // 2. Fetch local user
    let [user] = await db.select().from(usersTable).where(eq(usersTable.supabaseUid, supabaseUser.id)).limit(1);

    // 3. Lazy provision if user exists in Supabase but profile is missing locally
    if (!user) {
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

    const organization = await ensureDefaultOrganizationForUser(
      user,
      COUNTRY_CURRENCY[(supabaseUser.user_metadata?.country || "GH").toUpperCase()] ?? "GHS",
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName ?? null,
        avatarUrl: user.avatarUrl ?? null,
        organizationId: organization.id,
        organizationName: organization.name,
        createdAt: user.createdAt.toISOString(),
      },
      token: authData.session.access_token,
    });
  } catch (err: any) {
    req.log?.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error during login" });
  }
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
    organizationId: (req as any).organization?.id ?? null,
    organizationName: (req as any).organization?.name ?? null,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", requireAuth, async (_req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ message: "Logged out successfully" });
  } catch {
    res.json({ message: "Logged out locally" });
  }
});

export default router;
