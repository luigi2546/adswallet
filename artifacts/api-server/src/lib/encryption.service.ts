import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
  }
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a colon-separated string: `ciphertext:iv:authTag` (all base64).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return [encrypted, iv.toString("base64"), authTag.toString("base64")].join(
    ":",
  );
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Input format: `ciphertext:iv:authTag` (all base64).
 */
export function decrypt(encryptedStr: string): string {
  const key = getKey();
  const parts = encryptedStr.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted string format");
  }

  const [ciphertext, ivB64, authTagB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Mask a card number for display: "4111123456781111" → "4111 **** **** 1111"
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, "");
  if (digits.length < 8) return "****";
  return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`;
}

/**
 * Extract last 4 digits from a card number for storage.
 */
export function getLast4(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, "");
  return digits.slice(-4);
}
