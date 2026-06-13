import { Router } from "express";
import { db, socialAccountsTable, oauthTokensTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod";

const router = Router();

const connectAccountSchema = z.object({
  platform: z.enum(["facebook", "instagram", "tiktok", "google", "youtube"]),
  accountName: z.string().min(1),
  accountHandle: z.string().min(1),
});

// Seed followers based on platform (realistic ranges for African SMBs)
function seedFollowers(platform: string, handle: string): number {
  const hash = handle.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const ranges: Record<string, [number, number]> = {
    facebook: [500, 45000],
    instagram: [800, 30000],
    tiktok: [1200, 80000],
    youtube: [200, 15000],
    google: [50, 5000],
  };
  const [min, max] = ranges[platform] ?? [100, 10000];
  return min + (hash % (max - min));
}

type PostType = "post" | "reel" | "story" | "video";

// Generate deterministic mock posts for a connected account
function generateMockPosts(account: { id: number; platform: string; accountName: string; accountHandle: string; followers: number }) {
  const templates: Record<string, { types: PostType[]; captions: string[] }> = {
    facebook: {
      types: ["post", "post", "video", "post"],
      captions: [
        "Exciting news! We're launching something special this season. Stay tuned for exclusive deals and offers. 🌍",
        "Thank you to our amazing customers for your continued support! Your trust means everything to us.",
        "Behind the scenes at our workshop. Quality craftsmanship, every single day.",
        "Flash sale this weekend only! 30% off all products. Visit our store or shop online.",
      ],
    },
    instagram: {
      types: ["post", "reel", "post", "reel"],
      captions: [
        "New collection just dropped. Swipe to see the full range. Link in bio.",
        "Behind the scenes of our latest shoot. The process is everything.",
        "Customer love hits different. Tag us in your photos for a chance to be featured.",
        "This one sold out in 2 hours last time. We're restocking Friday. Set your reminders.",
      ],
    },
    tiktok: {
      types: ["video", "video", "reel", "video"],
      captions: [
        "POV: You just discovered the best product in Accra #GhanaTwitter #BuyGhanaGoods",
        "Day in the life of running a small business in Ghana. The grind is real.",
        "We did a blind taste test and the results surprised everyone!",
        "This product took 6 months to develop. Here's the full story.",
      ],
    },
    youtube: {
      types: ["video", "video", "video", "video"],
      captions: [
        "Full Product Review: Is It Worth It? (Honest Opinion)",
        "How We Grew Our Business from 0 to 500 Customers in 90 Days",
        "Top 5 Things You Need to Know Before Buying",
        "Customer Stories: Real People, Real Results",
      ],
    },
    google: {
      types: ["post", "post", "post", "post"],
      captions: [
        "Special offer this month for new customers. Visit us or call to book an appointment.",
        "We're now open on Sundays! Extended hours to serve you better.",
        "5-star service guaranteed. Read our latest reviews and see why customers choose us.",
        "New service added: Same-day delivery available in selected areas.",
      ],
    },
  };

  const { types, captions } = templates[account.platform] ?? templates.facebook;
  const now = new Date();

  return types.map((postType, i) => {
    const daysAgo = (i + 1) * 3;
    const postedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const baseEngagement = account.followers * 0.04;
    const factor = 1 - i * 0.15;

    return {
      id: `${account.id}-post-${i + 1}`,
      socialAccountId: account.id,
      platform: account.platform,
      postType,
      content: captions[i],
      mediaUrl: null,
      likes: Math.floor(baseEngagement * factor * (0.7 + Math.random() * 0.6)),
      comments: Math.floor(baseEngagement * factor * 0.08),
      shares: Math.floor(baseEngagement * factor * 0.04),
      reach: Math.floor(account.followers * 0.6 * factor),
      postedAt: postedAt.toISOString(),
    };
  });
}

// GET /social-accounts
router.get("/social-accounts", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const accounts = await db.select().from(socialAccountsTable).where(eq(socialAccountsTable.userId, userId));

  res.json(accounts.map(a => ({
    id: a.id,
    platform: a.platform,
    accountName: a.accountName,
    accountHandle: a.accountHandle,
    avatarUrl: a.avatarUrl,
    followers: a.followers,
    status: a.status,
    connectedAt: a.connectedAt,
  })));
});

// POST /social-accounts
router.post("/social-accounts", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = connectAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  const { platform, accountName, accountHandle } = parsed.data;
  const followers = seedFollowers(platform, accountHandle);

  const [account] = await db.insert(socialAccountsTable).values({
    userId,
    platform,
    accountName,
    accountHandle,
    followers,
    status: "connected",
  }).returning();

  res.status(201).json({
    id: account.id,
    platform: account.platform,
    accountName: account.accountName,
    accountHandle: account.accountHandle,
    avatarUrl: account.avatarUrl,
    followers: account.followers,
    status: account.status,
    connectedAt: account.connectedAt,
  });
});

// DELETE /social-accounts/:id
router.delete("/social-accounts/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = parseInt(req.params.id as string, 10);

  await db.delete(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, userId))
  );

  res.status(204).send();
});

// GET /social-accounts/:id/posts
router.get("/social-accounts/:id/posts", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = parseInt(req.params.id as string, 10);

  const [account] = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, userId))
  ).limit(1);

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  // Try to use real OAuth token if available and not expired
  const [token] = await db.select().from(oauthTokensTable).where(
    and(eq(oauthTokensTable.userId, userId), eq(oauthTokensTable.platform, account.platform))
  ).limit(1);

  const hasValidToken = token && (!token.expiresAt || token.expiresAt > new Date());

  if (hasValidToken) {
    try {
      const realPosts = await fetchRealPosts(account.platform, token.accessToken, account);
      if (realPosts && realPosts.length > 0) {
        res.json(realPosts);
        return;
      }
    } catch (err) {
      req.log?.warn({ err, platform: account.platform }, "Real posts fetch failed, falling back to mock");
    }
  }

  const posts = generateMockPosts(account);
  res.json(posts);
});

async function fetchRealPosts(
  platform: string,
  accessToken: string,
  account: { id: number; platform: string; accountName: string; accountHandle: string; followers: number }
): Promise<object[] | null> {
  const base = { socialAccountId: account.id, platform };

  if (platform === "facebook") {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&limit=6&access_token=${accessToken}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    return (data.data ?? []).map((p: any, i: number) => ({
      id: `fb-${p.id}`,
      ...base,
      postType: "post",
      content: p.message ?? "(No caption)",
      mediaUrl: null,
      likes: p.likes?.summary?.total_count ?? 0,
      comments: p.comments?.summary?.total_count ?? 0,
      shares: p.shares?.count ?? 0,
      reach: Math.floor((p.likes?.summary?.total_count ?? 0) * 4.2),
      postedAt: p.created_time,
    }));
  }

  if (platform === "instagram") {
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id}&access_token=${accessToken}`
    );
    if (!meRes.ok) return null;
    const pages = ((await meRes.json()) as any).data ?? [];
    const igId = pages[0]?.instagram_business_account?.id;
    if (!igId) return null;

    const mediaRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count&limit=6&access_token=${accessToken}`
    );
    if (!mediaRes.ok) return null;
    const media = ((await mediaRes.json()) as any).data ?? [];
    return media.map((m: any) => ({
      id: `ig-${m.id}`,
      ...base,
      postType: m.media_type === "VIDEO" ? "reel" : "post",
      content: m.caption ?? "(No caption)",
      mediaUrl: null,
      likes: m.like_count ?? 0,
      comments: m.comments_count ?? 0,
      shares: 0,
      reach: Math.floor((m.like_count ?? 0) * 5.1),
      postedAt: m.timestamp,
    }));
  }

  if (platform === "youtube") {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=6`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const ids = (data.items ?? []).map((i: any) => i.id?.videoId).filter(Boolean).join(",");
    if (!ids) return [];

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const stats = statsRes.ok ? ((await statsRes.json()) as any).items ?? [] : [];
    const statsMap: Record<string, any> = {};
    stats.forEach((s: any) => { statsMap[s.id] = s.statistics; });

    return (data.items ?? []).map((item: any) => {
      const vid = item.id?.videoId;
      const s = statsMap[vid] ?? {};
      return {
        id: `yt-${vid}`,
        ...base,
        postType: "video",
        content: item.snippet?.title ?? "(No title)",
        mediaUrl: item.snippet?.thumbnails?.default?.url ?? null,
        likes: parseInt(s.likeCount ?? "0", 10),
        comments: parseInt(s.commentCount ?? "0", 10),
        shares: 0,
        reach: parseInt(s.viewCount ?? "0", 10),
        postedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      };
    });
  }

  if (platform === "tiktok") {
    const res = await fetch(
      "https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,create_time,like_count,comment_count,share_count,view_count",
      { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ max_count: 6 }) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    return (data.data?.videos ?? []).map((v: any) => ({
      id: `tt-${v.id}`,
      ...base,
      postType: "video",
      content: v.video_description ?? v.title ?? "(No caption)",
      mediaUrl: null,
      likes: v.like_count ?? 0,
      comments: v.comment_count ?? 0,
      shares: v.share_count ?? 0,
      reach: v.view_count ?? 0,
      postedAt: new Date((v.create_time ?? 0) * 1000).toISOString(),
    }));
  }

  return null;
}

export default router;
