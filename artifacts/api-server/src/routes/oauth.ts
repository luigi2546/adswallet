import { Router } from "express";
import { db, socialAccountsTable, oauthTokensTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import {
  PLATFORM_CONFIGS,
  buildOAuthUrl,
  exchangeCodeForToken,
  fetchPlatformProfile,
  generateState,
  verifyState,
  isDemoMode,
  getDemoProfile,
  getAppDomain,
} from "../lib/oauth";

const router = Router();

const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_CONFIGS);

// GET /api/oauth/connect/:platform
// Returns { url, demo } — frontend redirects to url
router.get("/oauth/connect/:platform", requireAuth, async (req, res) => {
  const platform = req.params.platform as string;
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    res.status(400).json({ error: `Unsupported platform: ${platform}` });
    return;
  }

  const userId = (req as any).user.id;
  const organization = (req as any).organization;
  const frontendBase = `https://${getAppDomain()}/settings`;

  if (isDemoMode(platform)) {
    const profile = getDemoProfile(platform);
    await upsertSocialAccount(userId, organization.id, platform, profile);
    res.json({ url: `${frontendBase}?oauth_success=${platform}&demo=true`, demo: true });
    return;
  }

  const state = generateState(userId, platform, organization.id);
  const url = buildOAuthUrl(platform, state);
  res.json({ url, demo: false });
});

// GET /api/oauth/callback/:platform
// Browser redirect from the OAuth provider — exchanges code, stores token
router.get("/oauth/callback/:platform", async (req, res) => {
  const platform = req.params.platform as string;
  const { code, state, error } = req.query as Record<string, string>;
  const frontendBase = `https://${getAppDomain()}/settings`;

  if (error) {
    res.redirect(`${frontendBase}?oauth_error=${encodeURIComponent(error)}&platform=${platform}`);
    return;
  }

  if (!code || !state) {
    res.redirect(`${frontendBase}?oauth_error=missing_params&platform=${platform}`);
    return;
  }

  const stateData = verifyState(state);
  if (!stateData) {
    res.redirect(`${frontendBase}?oauth_error=invalid_state&platform=${platform}`);
    return;
  }

  const { userId, organizationId } = stateData;

  try {
    const tokens = await exchangeCodeForToken(platform, code);
    const profile = await fetchPlatformProfile(platform, tokens.access_token);

    await upsertSocialAccount(userId, organizationId, platform, profile);

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    await db
      .insert(oauthTokensTable)
      .values({
        userId,
        organizationId,
        platform: platform as any,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt,
        scopes: PLATFORM_CONFIGS[platform]?.scopes ?? null,
        platformUserId: profile.platformUserId,
        platformUsername: profile.accountHandle,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [oauthTokensTable.organizationId, oauthTokensTable.platform],
        set: {
          userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? null,
          expiresAt,
          platformUserId: profile.platformUserId,
          platformUsername: profile.accountHandle,
          updatedAt: new Date(),
        },
      });

    res.redirect(`${frontendBase}?oauth_success=${platform}`);
  } catch (err: any) {
    req.log?.error({ err }, "OAuth callback error");
    res.redirect(`${frontendBase}?oauth_error=${encodeURIComponent(err.message ?? "unknown")}&platform=${platform}`);
  }
});

// GET /api/oauth/status
// Returns which platforms have valid tokens for the current user
router.get("/oauth/status", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const tokens = await db.select({
    platform: oauthTokensTable.platform,
    expiresAt: oauthTokensTable.expiresAt,
    platformUsername: oauthTokensTable.platformUsername,
    updatedAt: oauthTokensTable.updatedAt,
  }).from(oauthTokensTable).where(eq(oauthTokensTable.organizationId, organization.id));

  const status = tokens.reduce((acc, t) => {
    const expired = t.expiresAt ? t.expiresAt < new Date() : false;
    acc[t.platform] = {
      connected: !expired,
      expired,
      username: t.platformUsername,
      connectedAt: t.updatedAt,
    };
    return acc;
  }, {} as Record<string, { connected: boolean; expired: boolean; username: string | null; connectedAt: Date }>);

  res.json(status);
});

// DELETE /api/oauth/:platform
// Revoke token for a platform
router.delete("/oauth/:platform", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const platform = req.params.platform as string;

  await db.delete(oauthTokensTable).where(
    and(eq(oauthTokensTable.organizationId, organization.id), eq(oauthTokensTable.platform, platform as any))
  );

  res.status(204).send();
});

// ── Helper ───────────────────────────────────────────────────────────────────

async function upsertSocialAccount(
  userId: number,
  organizationId: number,
  platform: string,
  profile: { platformUserId: string; accountName: string; accountHandle: string; avatarUrl: string | null; followers: number }
) {
  const existing = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.organizationId, organizationId), eq(socialAccountsTable.platform, platform as any))
  ).limit(1);

  if (existing.length > 0) {
    await db.update(socialAccountsTable).set({
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
      followers: profile.followers,
      status: "connected",
    }).where(and(eq(socialAccountsTable.organizationId, organizationId), eq(socialAccountsTable.platform, platform as any)));
  } else {
    await db.insert(socialAccountsTable).values({
      userId,
      organizationId,
      platform: platform as any,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
      followers: profile.followers,
      status: "connected",
    });
  }
}

export default router;
