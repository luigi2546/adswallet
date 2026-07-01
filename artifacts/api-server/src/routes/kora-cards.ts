import { Router } from "express";
import {
  db,
  koraVirtualCardsTable,
  cardAdAccountsTable,
  walletsTable,
  transactionsTable,
  activityTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";
import * as koraService from "../lib/kora.service";
import { encrypt, maskCardNumber, getLast4 } from "../lib/encryption.service";

const router = Router();

// ── Create Virtual Card ────────────────────────────────────────────────────────

router.post("/kora/cards", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const organization = (req as any).organization;
  const { amountUsd, spendingLimit, purpose } = req.body;

  if (!amountUsd || amountUsd <= 0) {
    res.status(400).json({ error: "amountUsd must be a positive number" });
    return;
  }

  const limit = spendingLimit ?? amountUsd;
  const cardPurpose = purpose ?? "general";

  // Validate user has sufficient wallet balance
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.organizationId, organization.id))
    .limit(1);

  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  const currentBalance = parseFloat(wallet.creditBalance);
  if (currentBalance < amountUsd) {
    res.status(400).json({
      error: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Requested: $${amountUsd.toFixed(2)}`,
    });
    return;
  }

  try {
    // Call Kora to create the card
    const koraResponse = await koraService.createVirtualCard({
      amountUsd,
      cardholderName: user.name,
      customerEmail: user.email,
    });

    const cardData = koraResponse.data;

    // Encrypt sensitive card data
    const cardNumberEnc = encrypt(cardData.card_number);
    const expiryEnc = encrypt(`${cardData.expiry_month}/${cardData.expiry_year}`);
    const cvvEnc = encrypt(cardData.cvv);
    const last4 = getLast4(cardData.card_number);

    // Store card in DB
    const [card] = await db
      .insert(koraVirtualCardsTable)
      .values({
        userId: user.id,
        organizationId: organization.id,
        walletId: wallet.id,
        koraCardId: cardData.id,
        cardNumberEnc,
        expiryEnc,
        cvvEnc,
        cardNumberLast4: last4,
        cardholderName: user.name,
        status: "active",
        balanceUsd: amountUsd.toFixed(2),
        spendingLimit: limit.toFixed(2),
        purpose: cardPurpose,
      })
      .returning();

    // Deduct from wallet balance
    const newBalance = currentBalance - amountUsd;
    const newSpent = parseFloat(wallet.totalSpent) + amountUsd;
    await db
      .update(walletsTable)
      .set({
        creditBalance: newBalance.toFixed(2),
        totalSpent: newSpent.toFixed(2),
      })
      .where(eq(walletsTable.id, wallet.id));

    await db.insert(transactionsTable).values({
      userId: user.id,
      organizationId: organization.id,
      walletId: wallet.id,
      type: "spend",
      amount: amountUsd.toFixed(2),
      credits: amountUsd.toFixed(2),
      status: "completed",
      description: `Virtual card funding: ****${last4}`,
      reference: card.koraCardId,
      method: null,
    });

    // Log activity
    await db.insert(activityTable).values({
      userId: user.id,
      organizationId: organization.id,
      type: "credits_deducted",
      title: "Virtual Card Created",
      description: `$${amountUsd.toFixed(2)} USD virtual card issued (****${last4})`,
      amount: amountUsd.toFixed(2),
      campaignId: null,
    });

    logger.info(
      { cardId: card.id, last4, amountUsd },
      "Virtual card created successfully",
    );

    // Return masked card details — show full details only on creation
    res.status(201).json({
      id: card.id,
      koraCardId: card.koraCardId,
      cardNumberMasked: maskCardNumber(cardData.card_number),
      expiry: `${cardData.expiry_month}/${cardData.expiry_year}`,
      cvv: cardData.cvv, // Only shown once on creation
      balance: amountUsd,
      spendingLimit: limit,
      status: "active",
      purpose: cardPurpose,
      createdAt: card.createdAt.toISOString(),
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to create virtual card");
    res.status(500).json({ error: "Failed to create virtual card. Please try again." });
  }
});

// ── List User's Cards ──────────────────────────────────────────────────────────

router.get("/kora/cards", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const statusFilter = req.query.status as string | undefined;

  const conditions = [eq(koraVirtualCardsTable.organizationId, organization.id)];
  // Note: status filter would need a cast; for simplicity we filter in-app
  const cards = await db
    .select()
    .from(koraVirtualCardsTable)
    .where(and(...conditions))
    .orderBy(desc(koraVirtualCardsTable.createdAt));

  const filtered = statusFilter
    ? cards.filter((c) => c.status === statusFilter)
    : cards;

  // Count linked ad accounts per card
  const allAdAccounts = await db
    .select()
    .from(cardAdAccountsTable)
    .where(eq(cardAdAccountsTable.organizationId, organization.id));

  const adAccountCounts = new Map<number, number>();
  for (const aa of allAdAccounts) {
    adAccountCounts.set(aa.cardId, (adAccountCounts.get(aa.cardId) ?? 0) + 1);
  }

  res.json({
    cards: filtered.map((c) => ({
      id: c.id,
      cardNumberMasked: `**** **** **** ${c.cardNumberLast4}`,
      last4: c.cardNumberLast4,
      balance: parseFloat(c.balanceUsd),
      spendingLimit: parseFloat(c.spendingLimit),
      status: c.status,
      purpose: c.purpose,
      linkedAdAccounts: adAccountCounts.get(c.id) ?? 0,
      createdAt: c.createdAt.toISOString(),
    })),
    total: filtered.length,
  });
});

// ── Get Card Details ───────────────────────────────────────────────────────────

router.get("/kora/cards/:id", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const cardId = parseInt(req.params.id as string, 10);

  if (isNaN(cardId)) {
    res.status(400).json({ error: "Invalid card ID" });
    return;
  }

  const [card] = await db
    .select()
    .from(koraVirtualCardsTable)
    .where(
      and(
        eq(koraVirtualCardsTable.id, cardId),
        eq(koraVirtualCardsTable.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  // Count linked ad accounts
  const adAccounts = await db
    .select()
    .from(cardAdAccountsTable)
    .where(and(eq(cardAdAccountsTable.cardId, card.id), eq(cardAdAccountsTable.organizationId, organization.id)));

  res.json({
    id: card.id,
    cardNumberMasked: `**** **** **** ${card.cardNumberLast4}`,
    last4: card.cardNumberLast4,
    cardholderName: card.cardholderName,
    balance: parseFloat(card.balanceUsd),
    spendingLimit: parseFloat(card.spendingLimit),
    status: card.status,
    purpose: card.purpose,
    linkedAdAccounts: adAccounts.length,
    createdAt: card.createdAt.toISOString(),
  });
});

// ── Update Card Status (Freeze / Close) ────────────────────────────────────────

router.patch("/kora/cards/:id/status", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const cardId = parseInt(req.params.id as string, 10);
  const { status } = req.body;

  if (isNaN(cardId)) {
    res.status(400).json({ error: "Invalid card ID" });
    return;
  }

  if (!["frozen", "closed"].includes(status)) {
    res.status(400).json({ error: "Status must be 'frozen' or 'closed'" });
    return;
  }

  const [card] = await db
    .select()
    .from(koraVirtualCardsTable)
    .where(
      and(
        eq(koraVirtualCardsTable.id, cardId),
        eq(koraVirtualCardsTable.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  if (card.status === "closed") {
    res.status(400).json({ error: "Cannot modify a closed card" });
    return;
  }

  try {
    // Call Kora API
    if (status === "frozen") {
      await koraService.freezeCard(card.koraCardId);
    } else {
      await koraService.closeCard(card.koraCardId);
    }

    // Update DB
    await db
      .update(koraVirtualCardsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(koraVirtualCardsTable.id, card.id));

    logger.info({ cardId: card.id, newStatus: status }, "Card status updated");

    res.json({ id: card.id, status });
  } catch (err: any) {
    logger.error({ err: err.message, cardId }, "Failed to update card status");
    res.status(500).json({ error: "Failed to update card status" });
  }
});

// ── Link Card to Ad Account ────────────────────────────────────────────────────

router.post("/kora/cards/:id/ad-accounts", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const organization = (req as any).organization;
  const cardId = parseInt(req.params.id as string, 10);
  const { adPlatform, adAccountId, adAccountName } = req.body;

  if (isNaN(cardId)) {
    res.status(400).json({ error: "Invalid card ID" });
    return;
  }

  if (!adPlatform || !adAccountId || !adAccountName) {
    res.status(400).json({ error: "adPlatform, adAccountId, and adAccountName are required" });
    return;
  }

  const validPlatforms = ["facebook", "instagram", "tiktok", "google", "youtube"];
  if (!validPlatforms.includes(adPlatform)) {
    res.status(400).json({ error: `adPlatform must be one of: ${validPlatforms.join(", ")}` });
    return;
  }

  // Verify card belongs to user
  const [card] = await db
    .select()
    .from(koraVirtualCardsTable)
    .where(
      and(
        eq(koraVirtualCardsTable.id, cardId),
        eq(koraVirtualCardsTable.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  if (card.status !== "active") {
    res.status(400).json({ error: "Can only link ad accounts to active cards" });
    return;
  }

  // Check for duplicate link
  const existingLinks = await db
    .select()
    .from(cardAdAccountsTable)
    .where(
      and(
        eq(cardAdAccountsTable.cardId, cardId),
        eq(cardAdAccountsTable.adAccountId, adAccountId),
        eq(cardAdAccountsTable.adPlatform, adPlatform),
        eq(cardAdAccountsTable.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (existingLinks.length > 0) {
    res.status(409).json({ error: "This ad account is already linked to this card" });
    return;
  }

  const [link] = await db
    .insert(cardAdAccountsTable)
    .values({
      cardId,
      userId: user.id,
      organizationId: organization.id,
      adPlatform,
      adAccountId,
      adAccountName,
    })
    .returning();

  res.status(201).json({
    id: link.id,
    cardId: link.cardId,
    adPlatform: link.adPlatform,
    adAccountId: link.adAccountId,
    adAccountName: link.adAccountName,
    status: link.status,
    createdAt: link.createdAt.toISOString(),
  });
});

// ── List Linked Ad Accounts ────────────────────────────────────────────────────

router.get("/kora/cards/:id/ad-accounts", requireAuth, async (req, res) => {
  const organization = (req as any).organization;
  const cardId = parseInt(req.params.id as string, 10);

  if (isNaN(cardId)) {
    res.status(400).json({ error: "Invalid card ID" });
    return;
  }

  // Verify card belongs to user
  const [card] = await db
    .select()
    .from(koraVirtualCardsTable)
    .where(
      and(
        eq(koraVirtualCardsTable.id, cardId),
        eq(koraVirtualCardsTable.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const adAccounts = await db
    .select()
    .from(cardAdAccountsTable)
    .where(and(eq(cardAdAccountsTable.cardId, cardId), eq(cardAdAccountsTable.organizationId, organization.id)))
    .orderBy(desc(cardAdAccountsTable.createdAt));

  res.json({
    adAccounts: adAccounts.map((a) => ({
      id: a.id,
      adPlatform: a.adPlatform,
      adAccountId: a.adAccountId,
      adAccountName: a.adAccountName,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
    })),
  });
});

export default router;
