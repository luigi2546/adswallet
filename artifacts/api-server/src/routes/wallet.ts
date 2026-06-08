import { Router } from "express";
import { db, walletsTable, transactionsTable, activityTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { DepositFundsBody, GetTransactionsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/wallet", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);
  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }
  res.json({
    id: wallet.id,
    userId: wallet.userId,
    creditBalance: parseFloat(wallet.creditBalance),
    totalDeposited: parseFloat(wallet.totalDeposited),
    totalSpent: parseFloat(wallet.totalSpent),
    currency: wallet.currency,
  });
});

router.post("/wallet/deposit", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = DepositFundsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { amount, method, phone, provider } = parsed.data;

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);
  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  const reference = `DEP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const newBalance = parseFloat(wallet.creditBalance) + amount;
  const newTotal = parseFloat(wallet.totalDeposited) + amount;

  await db.update(walletsTable)
    .set({
      creditBalance: newBalance.toFixed(2),
      totalDeposited: newTotal.toFixed(2),
    })
    .where(eq(walletsTable.id, wallet.id));

  const [tx] = await db.insert(transactionsTable).values({
    userId: user.id,
    walletId: wallet.id,
    type: "deposit",
    amount: amount.toFixed(2),
    credits: amount.toFixed(2),
    status: "completed",
    description: `Mobile Money deposit via ${provider ?? method}${phone ? ` (${phone})` : ""}`,
    reference,
    method,
  }).returning();

  await db.insert(activityTable).values({
    userId: user.id,
    type: "deposit",
    title: "Deposit Completed",
    description: `${amount.toFixed(2)} GHS deposited → ${amount.toFixed(2)} Ad Credits`,
    amount: amount.toFixed(2),
    campaignId: null,
  });

  res.status(201).json({
    id: tx.id,
    type: tx.type,
    amount: parseFloat(tx.amount),
    credits: tx.credits ? parseFloat(tx.credits) : null,
    status: tx.status,
    description: tx.description ?? null,
    reference: tx.reference ?? null,
    createdAt: tx.createdAt.toISOString(),
  });
});

router.get("/wallet/transactions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const params = GetTransactionsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(transactionsTable.userId, user.id)];

  const txs = await db.select()
    .from(transactionsTable)
    .where(and(...conditions))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(transactionsTable, eq(transactionsTable.userId, user.id));

  res.json({
    transactions: txs.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      credits: tx.credits ? parseFloat(tx.credits) : null,
      status: tx.status,
      description: tx.description ?? null,
      reference: tx.reference ?? null,
      createdAt: tx.createdAt.toISOString(),
    })),
    total,
  });
});

export default router;
