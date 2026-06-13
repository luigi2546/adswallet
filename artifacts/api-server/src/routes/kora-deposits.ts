import { Router } from "express";
import crypto from "crypto";
import {
  db,
  koraDepositsTable,
  koraWebhooksTable,
  walletsTable,
  activityTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";
import * as koraService from "../lib/kora.service";

const router = Router();

const ADWALLET_FEE_PERCENT = parseFloat(process.env.ADWALLET_FEE_PERCENT ?? "1.5");
const EXCHANGE_RATE_MARKUP_PERCENT = 1.0; // 1% markup on Kora's rate

// ── Initialize Deposit ─────────────────────────────────────────────────────────

router.post("/kora/deposits/initialize", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { amount, currency, paymentMethod, provider, phone, email } = req.body;

  if (!amount || !currency || !paymentMethod) {
    res.status(400).json({ error: "amount, currency, and paymentMethod are required" });
    return;
  }

  if (amount <= 0) {
    res.status(400).json({ error: "amount must be positive" });
    return;
  }

  const validCurrencies = ["GHS", "NGN", "KES"];
  if (!validCurrencies.includes(currency)) {
    res.status(400).json({ error: `currency must be one of: ${validCurrencies.join(", ")}` });
    return;
  }

  // Get wallet
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, user.id))
    .limit(1);

  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  // Generate unique reference
  const reference = `AW-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  try {
    // Call Kora to initialize the charge
    const koraResponse = await koraService.initializeCharge({
      amount,
      currency,
      paymentMethod,
      customerEmail: email ?? user.email,
      customerName: user.name,
      reference,
      provider,
      phone,
    });

    // Save deposit record
    const [deposit] = await db
      .insert(koraDepositsTable)
      .values({
        userId: user.id,
        walletId: wallet.id,
        koraReference: reference,
        amountLocal: amount.toFixed(2),
        localCurrency: currency,
        status: "pending",
        paymentMethod,
        provider: provider ?? null,
        phone: phone ?? null,
        email: email ?? user.email,
        authorizationUrl: koraResponse.data?.checkout_url ?? null,
        koraResponseRaw: JSON.stringify({
          status: koraResponse.status,
          message: koraResponse.message,
          reference: koraResponse.data?.reference,
        }),
      })
      .returning();

    res.status(201).json({
      id: deposit.id,
      reference: deposit.koraReference,
      authorizationUrl: deposit.authorizationUrl,
      status: deposit.status,
      amount: parseFloat(deposit.amountLocal),
      currency: deposit.localCurrency,
    });
  } catch (err: any) {
    logger.error({ err: err.message, reference }, "Failed to initialize Kora charge");
    res.status(500).json({ error: "Failed to initialize deposit. Please try again." });
  }
});

// ── Get Deposit Status ─────────────────────────────────────────────────────────

router.get("/kora/deposits/:id/status", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const depositId = parseInt(req.params.id as string, 10);

  if (isNaN(depositId)) {
    res.status(400).json({ error: "Invalid deposit ID" });
    return;
  }

  const [deposit] = await db
    .select()
    .from(koraDepositsTable)
    .where(
      and(eq(koraDepositsTable.id, depositId), eq(koraDepositsTable.userId, user.id)),
    )
    .limit(1);

  if (!deposit) {
    res.status(404).json({ error: "Deposit not found" });
    return;
  }

  // If still pending, optionally poll Kora for fresh status
  if (deposit.status === "pending" || deposit.status === "processing") {
    try {
      const fresh = await koraService.getChargeStatus(deposit.koraReference);
      if (fresh.data.status !== deposit.status) {
        // Update will be handled by webhook, but we reflect the latest status
        logger.info(
          { reference: deposit.koraReference, oldStatus: deposit.status, newStatus: fresh.data.status },
          "Deposit status changed on poll",
        );
      }
    } catch {
      // Polling failure is non-fatal — return DB state
    }
  }

  res.json({
    id: deposit.id,
    reference: deposit.koraReference,
    status: deposit.status,
    amountLocal: parseFloat(deposit.amountLocal),
    localCurrency: deposit.localCurrency,
    amountUsd: deposit.amountUsd ? parseFloat(deposit.amountUsd) : null,
    exchangeRate: deposit.exchangeRate ? parseFloat(deposit.exchangeRate) : null,
    fee: parseFloat(deposit.fee),
    adwalletFee: parseFloat(deposit.adwalletFee),
    paymentMethod: deposit.paymentMethod,
    provider: deposit.provider,
    createdAt: deposit.createdAt.toISOString(),
  });
});

// ── List Deposits ──────────────────────────────────────────────────────────────

router.get("/kora/deposits", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const page = parseInt((req.query.page as string) ?? "1", 10) || 1;
  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10) || 20, 100);
  const offset = (page - 1) * limit;

  const deposits = await db
    .select()
    .from(koraDepositsTable)
    .where(eq(koraDepositsTable.userId, user.id))
    .orderBy(desc(koraDepositsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(
    koraDepositsTable,
    eq(koraDepositsTable.userId, user.id),
  );

  res.json({
    deposits: deposits.map((d) => ({
      id: d.id,
      reference: d.koraReference,
      status: d.status,
      amountLocal: parseFloat(d.amountLocal),
      localCurrency: d.localCurrency,
      amountUsd: d.amountUsd ? parseFloat(d.amountUsd) : null,
      exchangeRate: d.exchangeRate ? parseFloat(d.exchangeRate) : null,
      fee: parseFloat(d.fee),
      adwalletFee: parseFloat(d.adwalletFee),
      paymentMethod: d.paymentMethod,
      provider: d.provider,
      createdAt: d.createdAt.toISOString(),
    })),
    total,
    page,
  });
});

// ── Kora Webhook ───────────────────────────────────────────────────────────────

router.post("/kora/webhooks", async (req, res) => {
  const signature = req.headers["x-korapay-signature"] as string;

  // Verify webhook signature
  if (signature) {
    const rawBody = JSON.stringify(req.body);
    const isValid = koraService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn("Invalid Kora webhook signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
  }

  const { event, data } = req.body;

  if (!event || !data?.reference) {
    res.status(400).json({ error: "Invalid webhook payload" });
    return;
  }

  // Idempotency check
  const eventId = `${event}_${data.reference}`;
  const [existing] = await db
    .select()
    .from(koraWebhooksTable)
    .where(eq(koraWebhooksTable.eventId, eventId))
    .limit(1);

  if (existing) {
    logger.info({ eventId }, "Duplicate webhook — already processed");
    res.status(200).json({ message: "Already processed" });
    return;
  }

  // Log the webhook for idempotency
  await db.insert(koraWebhooksTable).values({
    eventId,
    eventType: event,
    reference: data.reference,
    payloadRaw: JSON.stringify({ event, status: data.status, amount: data.amount }),
  });

  // Find the matching deposit
  const [deposit] = await db
    .select()
    .from(koraDepositsTable)
    .where(eq(koraDepositsTable.koraReference, data.reference))
    .limit(1);

  if (!deposit) {
    logger.warn({ reference: data.reference }, "Webhook for unknown deposit");
    res.status(200).json({ message: "Unknown reference — acknowledged" });
    return;
  }

  if (event === "charge.completed" || event === "charge.success") {
    // Calculate fees and USD amount
    const koraFee = data.fee ?? 0;
    const exchangeRate = data.exchange_rate ?? data.rate ?? 1;
    // Apply 1% markup to exchange rate
    const adjustedRate = exchangeRate * (1 + EXCHANGE_RATE_MARKUP_PERCENT / 100);
    const amountAfterKoraFee = parseFloat(deposit.amountLocal) - koraFee;
    const adwalletFee = amountAfterKoraFee * (ADWALLET_FEE_PERCENT / 100);
    const netAmountLocal = amountAfterKoraFee - adwalletFee;
    const amountUsd = adjustedRate > 0 ? netAmountLocal / adjustedRate : 0;

    // Update deposit
    await db
      .update(koraDepositsTable)
      .set({
        status: "completed",
        exchangeRate: adjustedRate.toFixed(6),
        fee: koraFee.toFixed(2),
        adwalletFee: adwalletFee.toFixed(2),
        amountUsd: amountUsd.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(koraDepositsTable.id, deposit.id));

    // Credit user's wallet
    const [wallet] = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.id, deposit.walletId))
      .limit(1);

    if (wallet) {
      const newBalance = parseFloat(wallet.creditBalance) + amountUsd;
      const newTotal = parseFloat(wallet.totalDeposited) + amountUsd;

      await db
        .update(walletsTable)
        .set({
          creditBalance: newBalance.toFixed(2),
          totalDeposited: newTotal.toFixed(2),
        })
        .where(eq(walletsTable.id, wallet.id));
    }

    // Log activity
    await db.insert(activityTable).values({
      userId: deposit.userId,
      type: "deposit",
      title: "Kora Deposit Completed",
      description: `${parseFloat(deposit.amountLocal).toFixed(2)} ${deposit.localCurrency} → $${amountUsd.toFixed(2)} USD credited`,
      amount: amountUsd.toFixed(2),
      campaignId: null,
    });

    logger.info(
      { reference: data.reference, amountUsd: amountUsd.toFixed(2) },
      "Kora deposit completed and wallet credited",
    );
  } else if (event === "charge.failed") {
    await db
      .update(koraDepositsTable)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(koraDepositsTable.id, deposit.id));

    logger.info({ reference: data.reference }, "Kora deposit failed");
  }

  res.status(200).json({ message: "Webhook processed" });
});

export default router;
