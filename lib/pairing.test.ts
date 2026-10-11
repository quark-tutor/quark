import { describe, expect, it } from "vitest";
import { generateDeviceToken, generatePairingCode, hashSecret, isPairingCode } from "./pairing";

describe("pairing codes", () => {
  it("are always six digits, keeping leading zeros", () => {
    for (let i = 0; i < 1000; i++) expect(generatePairingCode()).toMatch(/^\d{6}$/);
  });

  it("accepts only six digits", () => {
    expect(isPairingCode("012345")).toBe(true);
    expect(isPairingCode("12345")).toBe(false);
    expect(isPairingCode("1234567")).toBe(false);
    expect(isPairingCode("12 345")).toBe(false);
    expect(isPairingCode("abcdef")).toBe(false);
  });
});

describe("device tokens", () => {
  it("are long and unique", () => {
    const a = generateDeviceToken();
    const b = generateDeviceToken();
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(a).not.toBe(b);
  });

  it("hash the same way every time, and never to the token itself", () => {
    const token = generateDeviceToken();
    expect(hashSecret(token)).toBe(hashSecret(token));
    expect(hashSecret(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSecret(token)).not.toContain(token);
  });
});
