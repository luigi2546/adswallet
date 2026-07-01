import crypto from "crypto";
import { logger } from "./logger";

// ── Config ─────────────────────────────────────────────────────────────────────

const KORA_SECRET_KEY = process.env.KORA_SECRET_KEY ?? "";
const KORA_PUBLIC_KEY = process.env.KORA_PUBLIC_KEY ?? "";
const KORA_WEBHOOK_SECRET = process.env.KORA_WEBHOOK_SECRET ?? "";
const KORA_BASE_URL =
  process.env.KORA_API_BASE_URL ?? "https://api.korapay.com/merchant/api/v1";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 500;

// ── Helpers ────────────────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateIdempotencyKey(): string {
  return `idem_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Make an HTTP request to Kora with exponential backoff retry.
 * Uses native fetch (Node 18+).
 */
async function koraRequest<T = any>(
  method: string,
  path: string,
  body?: Record<string, any>,
  idempotencyKey?: string,
): Promise<T> {
  const url = `${KORA_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${KORA_SECRET_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        const errMsg = data?.message ?? data?.error ?? `HTTP ${response.status}`;
        // Don't retry 4xx client errors (except 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Kora API error (${response.status}): ${errMsg}`);
        }
        throw new Error(`Kora API error (${response.status}): ${errMsg}`);
      }

      return data as T;
    } catch (err: any) {
      lastError = err;
      // Don't retry client errors
      if (err.message?.includes("(4") && !err.message?.includes("(429)")) {
        throw err;
      }
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        logger.warn(
          { attempt: attempt + 1, delay, path },
          "Kora API retry after error",
        );
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("Kora API request failed after retries");
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface KoraChargeResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    checkout_url?: string;
    status: string;
    amount: number;
    currency: string;
    fee?: number;
    amount_expected?: number;
  };
}

export interface KoraChargeStatusResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    fee: number;
    amount_paid?: number;
  };
}

export interface KoraCardCreateResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    card_number: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
    balance: number;
    currency: string;
    status: string;
    card_type: string;
    name_on_card: string;
  };
}

export interface KoraCardDetailsResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    balance: number;
    currency: string;
    status: string;
    card_type: string;
    last_four: string;
    name_on_card: string;
  };
}

// ── Deposit Methods ────────────────────────────────────────────────────────────

/**
 * Initialize a payment charge with Kora (mobile money, bank transfer, or card).
 */
export async function initializeCharge(params: {
  amount: number;
  currency: string;
  paymentMethod: string;
  customerEmail: string;
  customerName: string;
  reference: string;
  redirectUrl?: string;
  provider?: string;
  phone?: string;
}): Promise<KoraChargeResponse> {
  const idempotencyKey = generateIdempotencyKey();
  const body: Record<string, any> = {
    amount: params.amount,
    currency: params.currency,
    reference: params.reference,
    notification_url: process.env.KORA_WEBHOOK_URL,
    redirect_url: params.redirectUrl ?? process.env.KORA_REDIRECT_URL,
    customer: {
      email: params.customerEmail,
      name: params.customerName,
    },
  };

  // For mobile money, include channel-specific fields
  if (params.paymentMethod === "mobile_money" && params.phone) {
    body.channel = {
      type: "mobile_money",
      provider: params.provider,
      phone: params.phone,
    };
  }

  logger.info(
    { reference: params.reference, amount: params.amount, currency: params.currency },
    "Initializing Kora charge",
  );

  return koraRequest<KoraChargeResponse>(
    "POST",
    "/charges/initialize",
    body,
    idempotencyKey,
  );
}

/**
 * Check the status of an existing charge.
 */
export async function getChargeStatus(
  reference: string,
): Promise<KoraChargeStatusResponse> {
  logger.info({ reference }, "Checking Kora charge status");
  return koraRequest<KoraChargeStatusResponse>(
    "GET",
    `/charges/${encodeURIComponent(reference)}`,
  );
}

// ── Card Issuing Methods ───────────────────────────────────────────────────────

/**
 * Create a new virtual card via Kora.
 */
export async function createVirtualCard(params: {
  amountUsd: number;
  cardholderName: string;
  customerEmail: string;
}): Promise<KoraCardCreateResponse> {
  const idempotencyKey = generateIdempotencyKey();

  logger.info(
    { amountUsd: params.amountUsd, cardholder: params.cardholderName },
    "Creating Kora virtual card",
  );

  return koraRequest<KoraCardCreateResponse>(
    "POST",
    "/issuing/cards",
    {
      amount: params.amountUsd,
      currency: "USD",
      name_on_card: params.cardholderName,
      customer_email: params.customerEmail,
    },
    idempotencyKey,
  );
}

/**
 * Get card details from Kora (balance, status, etc.).
 */
export async function getCardDetails(
  koraCardId: string,
): Promise<KoraCardDetailsResponse> {
  return koraRequest<KoraCardDetailsResponse>(
    "GET",
    `/issuing/cards/${encodeURIComponent(koraCardId)}`,
  );
}

/**
 * Freeze a virtual card.
 */
export async function freezeCard(
  koraCardId: string,
): Promise<{ status: boolean; message: string }> {
  logger.info({ koraCardId }, "Freezing Kora card");
  return koraRequest("PATCH", `/issuing/cards/${encodeURIComponent(koraCardId)}`, {
    status: "frozen",
  });
}

/**
 * Close (terminate) a virtual card.
 */
export async function closeCard(
  koraCardId: string,
): Promise<{ status: boolean; message: string }> {
  logger.info({ koraCardId }, "Closing Kora card");
  return koraRequest("PATCH", `/issuing/cards/${encodeURIComponent(koraCardId)}`, {
    status: "closed",
  });
}

// ── Webhook Verification ───────────────────────────────────────────────────────

/**
 * Verify that a webhook payload was signed by Kora.
 * Kora signs webhooks using HMAC-SHA256 of the raw body with the webhook secret.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
): boolean {
  if (!KORA_WEBHOOK_SECRET) {
    logger.warn("KORA_WEBHOOK_SECRET is not set — skipping signature verification");
    return true; // Allow in dev/test without secret
  }

  const expected = crypto
    .createHmac("sha256", KORA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}
