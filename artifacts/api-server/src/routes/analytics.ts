import { Router } from "express";
import { db, campaignsTable, walletsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { GetPerformanceMetricsQueryParams, GetActivityQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/analytics/dashboard", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);
  const campaigns = await db.select().from(campaignsTable).where(eq(campaignsTable.userId, user.id));

  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const completedCampaigns = campaigns.filter(c => c.status === "completed").length;
  const draftCampaigns = campaigns.filter(c => c.status === "draft").length;

  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions ?? 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks ?? 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions ?? 0), 0);

  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const totalSpent = parseFloat(wallet?.totalSpent ?? "0");
  const averageCpc = totalClicks > 0 ? totalSpent / totalClicks : 0;

  res.json({
    creditBalance: parseFloat(wallet?.creditBalance ?? "0"),
    totalDeposited: parseFloat(wallet?.totalDeposited ?? "0"),
    totalSpent,
    activeCampaigns,
    completedCampaigns,
    draftCampaigns,
    totalImpressions,
    totalClicks,
    totalConversions,
    averageCtr: parseFloat(averageCtr.toFixed(2)),
    averageCpc: parseFloat(averageCpc.toFixed(2)),
  });
});

router.get("/analytics/performance", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const params = GetPerformanceMetricsQueryParams.safeParse(req.query);
  const range = params.success ? (params.data.range ?? "30d") : "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const campaigns = await db.select().from(campaignsTable).where(eq(campaignsTable.userId, user.id));
  const activeCampaigns = campaigns.filter(c => c.status === "active" || c.status === "completed");

  const points = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    let spend = 0;
    let impressions = 0;
    let clicks = 0;
    let conversions = 0;

    for (const c of activeCampaigns) {
      if (c.launchedAt && c.launchedAt <= date) {
        const dailySpend = parseFloat(c.dailyBudget);
        const dailyImpressions = Math.floor((c.impressions ?? 0) / Math.max(days, 1));
        const dailyClicks = Math.floor((c.clicks ?? 0) / Math.max(days, 1));
        const dailyConversions = Math.floor((c.conversions ?? 0) / Math.max(days, 1));
        spend += dailySpend;
        impressions += dailyImpressions;
        clicks += dailyClicks;
        conversions += dailyConversions;
      }
    }

    const ctr = impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0;
    const cpc = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;

    points.push({ date: dateStr, spend: parseFloat(spend.toFixed(2)), impressions, clicks, conversions, ctr, cpc });
  }

  res.json(points);
});

router.get("/analytics/platform-breakdown", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const campaigns = await db.select().from(campaignsTable).where(eq(campaignsTable.userId, user.id));

  const platforms = ["facebook", "instagram", "tiktok", "google", "youtube"];
  const breakdown = platforms.map(platform => {
    const platformCampaigns = campaigns.filter(c => c.platform === platform);
    const spend = platformCampaigns.reduce((sum, c) => sum + parseFloat(c.creditsUsed), 0);
    const impressions = platformCampaigns.reduce((sum, c) => sum + (c.impressions ?? 0), 0);
    const clicks = platformCampaigns.reduce((sum, c) => sum + (c.clicks ?? 0), 0);
    return {
      platform,
      spend: parseFloat(spend.toFixed(2)),
      campaigns: platformCampaigns.length,
      impressions,
      clicks,
    };
  });

  res.json(breakdown.filter(b => b.campaigns > 0 || b.spend > 0));
});

router.get("/activity", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const params = GetActivityQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;

  const items = await db.select()
    .from(activityTable)
    .where(eq(activityTable.userId, user.id))
    .orderBy(desc(activityTable.createdAt))
    .limit(limit);

  res.json(items.map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    amount: item.amount ? parseFloat(item.amount) : null,
    campaignId: item.campaignId ?? null,
    createdAt: item.createdAt.toISOString(),
  })));
});

export default router;
