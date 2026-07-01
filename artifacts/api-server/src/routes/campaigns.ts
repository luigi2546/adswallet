import { Router } from "express";
import { db, campaignsTable, walletsTable, transactionsTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateCampaignBody, UpdateCampaignBody, GetCampaignParams, UpdateCampaignParams, LaunchCampaignParams, PauseCampaignParams, DeleteCampaignParams, GetCampaignsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatCampaign(c: any) {
  return {
    id: c.id,
    name: c.name,
    platform: c.platform,
    objective: c.objective,
    status: c.status,
    dailyBudget: parseFloat(c.dailyBudget),
    totalBudget: parseFloat(c.totalBudget),
    creditsUsed: parseFloat(c.creditsUsed),
    impressions: c.impressions ?? null,
    clicks: c.clicks ?? null,
    conversions: c.conversions ?? null,
    reach: c.reach ?? null,
    headline: c.headline ?? null,
    description: c.description ?? null,
    targetLocation: c.targetLocation ?? null,
    targetAge: c.targetAge ?? null,
    targetGender: c.targetGender ?? null,
    createdAt: c.createdAt.toISOString(),
    launchedAt: c.launchedAt ? c.launchedAt.toISOString() : null,
  };
}

router.get("/campaigns", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const params = GetCampaignsQueryParams.safeParse(req.query);
  const conditions: any[] = [eq(campaignsTable.organizationId, organization.id)];

  if (params.success && params.data.status) {
    conditions.push(eq(campaignsTable.status, params.data.status as any));
  }
  if (params.success && params.data.platform) {
    conditions.push(eq(campaignsTable.platform, params.data.platform as any));
  }

  const campaigns = await db.select().from(campaignsTable).where(and(...conditions));
  res.json(campaigns.map(formatCampaign));
});

router.post("/campaigns", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const organization = (req as any).organization;
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, platform, objective, dailyBudget, totalBudget, headline, description, targetLocation, targetAge, targetGender } = parsed.data;

  const [campaign] = await db.insert(campaignsTable).values({
    userId: user.id,
    organizationId: organization.id,
    name,
    platform: platform as any,
    objective: objective as any,
    status: "draft",
    dailyBudget: dailyBudget.toFixed(2),
    totalBudget: totalBudget.toFixed(2),
    creditsUsed: "0",
    headline: headline ?? null,
    description: description ?? null,
    targetLocation: targetLocation ?? null,
    targetAge: targetAge ?? null,
    targetGender: targetGender ?? null,
  }).returning();

  res.status(201).json(formatCampaign(campaign));
});

router.get("/campaigns/:id", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const idParsed = GetCampaignParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [campaign] = await db.select().from(campaignsTable)
    .where(and(eq(campaignsTable.id, idParsed.data.id), eq(campaignsTable.organizationId, organization.id)))
    .limit(1);
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json(formatCampaign(campaign));
});

router.patch("/campaigns/:id", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const idParsed = UpdateCampaignParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const updates: any = {};
  const d = parsed.data;
  if (d.name != null) updates.name = d.name;
  if (d.headline != null) updates.headline = d.headline;
  if (d.description != null) updates.description = d.description;
  if (d.dailyBudget != null) updates.dailyBudget = d.dailyBudget.toFixed(2);
  if (d.totalBudget != null) updates.totalBudget = d.totalBudget.toFixed(2);
  if (d.targetLocation != null) updates.targetLocation = d.targetLocation;
  if (d.targetAge != null) updates.targetAge = d.targetAge;
  if (d.targetGender != null) updates.targetGender = d.targetGender;

  const [updated] = await db.update(campaignsTable)
    .set(updates)
    .where(and(eq(campaignsTable.id, idParsed.data.id), eq(campaignsTable.organizationId, organization.id)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json(formatCampaign(updated));
});

router.delete("/campaigns/:id", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const idParsed = DeleteCampaignParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [deleted] = await db.delete(campaignsTable)
    .where(and(eq(campaignsTable.id, idParsed.data.id), eq(campaignsTable.organizationId, organization.id)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json({ message: "Campaign deleted" });
});

router.post("/campaigns/:id/launch", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const organization = (req as any).organization;
  const idParsed = LaunchCampaignParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [campaign] = await db.select().from(campaignsTable)
    .where(and(eq(campaignsTable.id, idParsed.data.id), eq(campaignsTable.organizationId, organization.id)))
    .limit(1);
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.organizationId, organization.id)).limit(1);
  const totalBudget = parseFloat(campaign.totalBudget);
  if (!wallet || parseFloat(wallet.creditBalance) < totalBudget) {
    res.status(400).json({ error: "Insufficient credits" });
    return;
  }

  const newBalance = parseFloat(wallet.creditBalance) - totalBudget;
  const newSpent = parseFloat(wallet.totalSpent) + totalBudget;
  await db.update(walletsTable).set({
    creditBalance: newBalance.toFixed(2),
    totalSpent: newSpent.toFixed(2),
  }).where(eq(walletsTable.id, wallet.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    organizationId: organization.id,
    walletId: wallet.id,
    type: "spend",
    amount: totalBudget.toFixed(2),
    credits: totalBudget.toFixed(2),
    status: "completed",
    description: `Campaign spend: ${campaign.name}`,
    reference: null,
    method: null,
  });

  const [updated] = await db.update(campaignsTable)
    .set({ status: "active", launchedAt: new Date(), creditsUsed: totalBudget.toFixed(2) })
    .where(and(eq(campaignsTable.id, idParsed.data.id), eq(campaignsTable.organizationId, organization.id)))
    .returning();

  await db.insert(activityTable).values({
    userId: user.id,
    organizationId: organization.id,
    type: "campaign_launched",
    title: "Campaign Launched",
    description: `"${campaign.name}" is now live on ${campaign.platform}`,
    amount: totalBudget.toFixed(2),
    campaignId: campaign.id,
  });

  res.json(formatCampaign(updated));
});

router.post("/campaigns/:id/pause", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const organization = (req as any).organization;
  const idParsed = PauseCampaignParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [updated] = await db.update(campaignsTable)
    .set({ status: "paused" })
    .where(and(eq(campaignsTable.id, idParsed.data.id), eq(campaignsTable.organizationId, organization.id)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  await db.insert(activityTable).values({
    userId: user.id,
    organizationId: organization.id,
    type: "campaign_paused",
    title: "Campaign Paused",
    description: `"${updated.name}" has been paused`,
    amount: null,
    campaignId: updated.id,
  });

  res.json(formatCampaign(updated));
});

export default router;
