import { createHash, randomBytes, randomInt } from "node:crypto";
import { PAIRING_CODE_LENGTH } from "./pairing-shared";

export { PAIRING_CODE_LENGTH };

export const DEVICE_COOKIE = "quark_device";
// 400 days, the longest lifetime browsers allow. "Forget this iPad" is how a pairing ends.
export const DEVICE_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

// A six-digit code a guardian reads off /parent and types on the iPad.
export function generatePairingCode(): string {
  return randomInt(0, 10 ** PAIRING_CODE_LENGTH).toString().padStart(PAIRING_CODE_LENGTH, "0");
}

export function isPairingCode(value: string): boolean {
  return value.length === PAIRING_CODE_LENGTH && /^\d+$/.test(value);
}

// The secret the iPad keeps in its cookie. Only its hash is stored.
export function generateDeviceToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}
