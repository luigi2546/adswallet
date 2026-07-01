import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "adwallet-secret-key";

export function getAppDomain(): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",") ?? [];
  return domains[0] ?? process.env.REPLIT_DEV_DOMAIN ?? "localhost";
}

export function getCallbackUri(platform: string): string {
  return `https://${getAppDomain()}/api/oauth/callback/${platform}`;
}

// ── State token (stateless, HMAC-signed) ────────────────────────────────────

export function generateState(userId: number, platform: string, organizationId: number): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${userId}:${platform}:${organizationId}:${nonce}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyState(state: string): { userId: number; platform: string; organizationId: number } | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 5) return null;
    const [userId, platform, organizationId, nonce, sig] = parts;
    const payload = `${userId}:${platform}:${organizationId}:${nonce}`;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    return { userId: parseInt(userId, 10), platform, organizationId: parseInt(organizationId, 10) };
  } catch {
    return null;
  }
}

// ── Platform configs ─────────────────────────────────────────────────────────

export type PlatformConfig = {
  provider: "meta" | "google" | "tiktok";
  authUrl: string;
  tokenUrl: string;
  scopes: string;
  getClientId: () => string;
  getClientSecret: () => string;
};

const PLACEHOLDER_PREFIX = "placeholder_";

export function isPlaceholder(value: string | undefined): boolean {
  return !value || value.startsWith(PLACEHOLDER_PREFIX);
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  facebook: {
    provider: "meta",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: "pages_show_list,pages_read_engagement,public_profile,email",
    getClientId: () => process.env.META_APP_ID ?? "",
    getClientSecret: () => process.env.META_APP_SECRET ?? "",
  },
  instagram: {
    provider: "meta",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: "instagram_basic,instagram_content_publish,pages_show_list,public_profile",
    getClientId: () => process.env.META_APP_ID ?? "",
    getClientSecret: () => process.env.META_APP_SECRET ?? "",
  },
  google: {
    provider: "google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: "openid profile email",
    getClientId: () => process.env.GOOGLE_CLIENT_ID ?? "",
    getClientSecret: () => process.env.GOOGLE_CLIENT_SECRET ?? "",
  },
  youtube: {
    provider: "google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: "openid profile email https://www.googleapis.com/auth/youtube.readonly",
    getClientId: () => process.env.GOOGLE_CLIENT_ID ?? "",
    getClientSecret: () => process.env.GOOGLE_CLIENT_SECRET ?? "",
  },
  tiktok: {
    provider: "tiktok",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: "user.info.basic,video.list",
    getClientId: () => process.env.TIKTOK_CLIENT_KEY ?? "",
    getClientSecret: () => process.env.TIKTOK_CLIENT_SECRET ?? "",
  },
};

export function isDemoMode(platform: string): boolean {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) return true;
  return isPlaceholder(cfg.getClientId());
}

// ── Build platform OAuth URL ─────────────────────────────────────────────────

export function buildOAuthUrl(platform: string, state: string): string {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) throw new Error(`Unknown platform: ${platform}`);
  const redirectUri = getCallbackUri(platform);

  if (cfg.provider === "meta") {
    const p = new URLSearchParams({
      client_id: cfg.getClientId(),
      redirect_uri: redirectUri,
      scope: cfg.scopes,
      state,
      response_type: "code",
    });
    return `${cfg.authUrl}?${p}`;
  }

  if (cfg.provider === "google") {
    const p = new URLSearchParams({
      client_id: cfg.getClientId(),
      redirect_uri: redirectUri,
      scope: cfg.scopes,
      state,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });
    return `${cfg.authUrl}?${p}`;
  }

  if (cfg.provider === "tiktok") {
    const p = new URLSearchParams({
      client_key: cfg.getClientId(),
      redirect_uri: redirectUri,
      scope: cfg.scopes,
      state,
      response_type: "code",
    });
    return `${cfg.authUrl}?${p}`;
  }

  throw new Error(`No URL builder for provider: ${cfg.provider}`);
}

// ── Token exchange ────────────────────────────────────────────────────────────

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
};

export async function exchangeCodeForToken(platform: string, code: string): Promise<TokenResponse> {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) throw new Error(`Unknown platform: ${platform}`);
  const redirectUri = getCallbackUri(platform);

  if (cfg.provider === "meta") {
    const p = new URLSearchParams({
      client_id: cfg.getClientId(),
      client_secret: cfg.getClientSecret(),
      redirect_uri: redirectUri,
      code,
    });
    const res = await fetch(`${cfg.tokenUrl}?${p}`);
    if (!res.ok) throw new Error(`Meta token exchange failed: ${await res.text()}`);
    return res.json() as Promise<TokenResponse>;
  }

  if (cfg.provider === "google") {
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: cfg.getClientId(),
        client_secret: cfg.getClientSecret(),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
    return res.json() as Promise<TokenResponse>;
  }

  if (cfg.provider === "tiktok") {
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_key: cfg.getClientId(),
        client_secret: cfg.getClientSecret(),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    if (!res.ok) throw new Error(`TikTok token exchange failed: ${await res.text()}`);
    const data = (await res.json()) as any;
    return {
      access_token: data.data?.access_token ?? data.access_token,
      refresh_token: data.data?.refresh_token ?? data.refresh_token,
      expires_in: data.data?.expires_in ?? data.expires_in,
      token_type: "bearer",
    };
  }

  throw new Error(`No token exchange for provider: ${cfg.provider}`);
}

// ── Fetch profile from platform ───────────────────────────────────────────────

export type PlatformProfile = {
  platformUserId: string;
  accountName: string;
  accountHandle: string;
  avatarUrl: string | null;
  followers: number;
};

export async function fetchPlatformProfile(platform: string, accessToken: string): Promise<PlatformProfile> {
  if (platform === "facebook") {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,picture.width(200)&access_token=${accessToken}`
    );
    if (!res.ok) throw new Error(`Meta profile fetch failed: ${await res.text()}`);
    const data = (await res.json()) as any;

    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,fan_count&access_token=${accessToken}`
    );
    const pages = pagesRes.ok ? ((await pagesRes.json()) as any).data ?? [] : [];
    const page = pages[0];
    return {
      platformUserId: page?.id ?? data.id,
      accountName: page?.name ?? data.name,
      accountHandle: (page?.name ?? data.name).toLowerCase().replace(/\s+/g, ""),
      avatarUrl: data.picture?.data?.url ?? null,
      followers: page?.fan_count ?? 0,
    };
  }

  if (platform === "instagram") {
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,picture.width(200)&access_token=${accessToken}`
    );
    if (!meRes.ok) throw new Error(`Meta profile fetch failed: ${await meRes.text()}`);
    const me = (await meRes.json()) as any;

    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,followers_count,profile_picture_url}&access_token=${accessToken}`
    );
    const pages = igRes.ok ? ((await igRes.json()) as any).data ?? [] : [];
    const igAccount = pages[0]?.instagram_business_account;

    return {
      platformUserId: igAccount?.id ?? me.id,
      accountName: igAccount?.username ?? me.name,
      accountHandle: igAccount?.username ?? me.name.toLowerCase().replace(/\s+/g, ""),
      avatarUrl: igAccount?.profile_picture_url ?? me.picture?.data?.url ?? null,
      followers: igAccount?.followers_count ?? 0,
    };
  }

  if (platform === "google" || platform === "youtube") {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) throw new Error(`Google profile fetch failed: ${await res.text()}`);
    const data = (await res.json()) as any;

    if (platform === "youtube") {
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const ytData = ytRes.ok ? ((await ytRes.json()) as any) : null;
      const channel = ytData?.items?.[0];
      return {
        platformUserId: channel?.id ?? data.sub,
        accountName: channel?.snippet?.title ?? data.name,
        accountHandle: channel?.snippet?.customUrl?.replace("@", "") ?? data.email?.split("@")[0],
        avatarUrl: channel?.snippet?.thumbnails?.default?.url ?? data.picture ?? null,
        followers: parseInt(channel?.statistics?.subscriberCount ?? "0", 10),
      };
    }

    return {
      platformUserId: data.sub,
      accountName: data.name,
      accountHandle: data.email?.split("@")[0] ?? data.sub,
      avatarUrl: data.picture ?? null,
      followers: 0,
    };
  }

  if (platform === "tiktok") {
    const res = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) throw new Error(`TikTok profile fetch failed: ${await res.text()}`);
    const data = (await res.json()) as any;
    const user = data.data?.user ?? {};
    return {
      platformUserId: user.open_id ?? "",
      accountName: user.display_name ?? "TikTok User",
      accountHandle: user.display_name?.toLowerCase().replace(/\s+/g, "") ?? "tiktokuser",
      avatarUrl: user.avatar_url ?? null,
      followers: user.follower_count ?? 0,
    };
  }

  throw new Error(`No profile fetcher for platform: ${platform}`);
}

// ── Demo mode: deterministic fake profile ────────────────────────────────────

const DEMO_PROFILES: Record<string, Omit<PlatformProfile, "platformUserId">> = {
  facebook: { accountName: "Mensah Digital Agency", accountHandle: "mensahdigital", avatarUrl: null, followers: 8240 },
  instagram: { accountName: "Mensah Style", accountHandle: "mensahstyle", avatarUrl: null, followers: 15420 },
  tiktok: { accountName: "GhanaEats Official", accountHandle: "ghanaeats", avatarUrl: null, followers: 32100 },
  google: { accountName: "Accra Digital Hub", accountHandle: "accradigitalhub", avatarUrl: null, followers: 1280 },
  youtube: { accountName: "AdWallet TV", accountHandle: "adwallettv", avatarUrl: null, followers: 4870 },
};

export function getDemoProfile(platform: string): PlatformProfile {
  const base = DEMO_PROFILES[platform] ?? DEMO_PROFILES.facebook;
  return { ...base, platformUserId: `demo_${platform}_${Date.now()}` };
}
