import { describe, expect, it } from "vitest";
import { authorized } from "./cron-auth";

describe("authorized", () => {
  const secret = "0123456789abcdefghij";

  it("accepts exactly Bearer and the secret", () => {
    expect(authorized(`Bearer ${secret}`, secret)).toBe(true);
  });

  it("refuses a wrong value, a missing header, a bare secret and a near miss", () => {
    expect(authorized("Bearer nope", secret)).toBe(false);
    expect(authorized(null, secret)).toBe(false);
    expect(authorized(secret, secret)).toBe(false);
    expect(authorized(`Bearer ${secret} `, secret)).toBe(false);
    expect(authorized(`bearer ${secret}`, secret)).toBe(false);
    expect(authorized(`Bearer ${secret.slice(0, -1)}`, secret)).toBe(false);
  });

  it("authorizes nothing when no secret is set, even an empty header or the word undefined", () => {
    expect(authorized("Bearer undefined", undefined)).toBe(false);
    expect(authorized("", undefined)).toBe(false);
    expect(authorized("Bearer ", "")).toBe(false);
    expect(authorized(null, undefined)).toBe(false);
  });
});
