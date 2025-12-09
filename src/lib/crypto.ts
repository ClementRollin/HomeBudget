import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getKey = () => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY est requis pour chiffrer les données sensibles.");
  }

  const buffer =
    secret.length === 44
      ? Buffer.from(secret, "base64")
      : createHash("sha256").update(secret).digest();

  if (buffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY doit générer une clé de 32 octets (utilisez un base64 32 bytes).");
  }
  return buffer;
};

export const encryptValue = (value: string) => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decryptValue = (payload: string) => {
  if (!payload) {
    return "";
  }
  const buffer = Buffer.from(payload, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const text = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString("utf8");
};

export const encryptNumber = (value: number) =>
  encryptValue(value.toFixed(2));

export const decryptNumber = (payload: string) =>
  Number(decryptValue(payload) || "0");
