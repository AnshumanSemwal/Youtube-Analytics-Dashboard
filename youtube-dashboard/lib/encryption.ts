import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error("TOKEN_ENCRYPTION_KEY is not set in environment variables.");
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (base64-encoded).");
  return buf;
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv  = randomBytes(12); // 96-bit IV — correct for AES-GCM

  const cipher    = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag   = cipher.getAuthTag(); // GCM authentication tag

  // Store as iv:encrypted:authTag — all base64
  return [
    iv.toString("base64"),
    encrypted.toString("base64"),
    authTag.toString("base64"),
  ].join(":");
}

export function decrypt(stored: string): string {
  // Fallback for plaintext tokens (migration safety net)
  // A token in our format always has exactly two colons
  const parts = stored.split(":");
  if (parts.length !== 3) return stored;

  try {
    const key = getKey();
    const [ivB64, encB64, tagB64] = parts;

    const iv        = Buffer.from(ivB64,  "base64");
    const encrypted = Buffer.from(encB64, "base64");
    const authTag   = Buffer.from(tagB64, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Decryption failed — return raw value (handles migration edge cases)
    return stored;
  }
}