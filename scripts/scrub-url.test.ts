import { describe, expect, it } from "vitest";
import { scrubUrl } from "./scrub-url";

// A made-up URL; nothing here is real.
const url = "postgresql://postgres.abcd:hunter2%21@db.example.invalid:5432/postgres";

describe("scrubUrl", () => {
  it("removes the whole connection string", () => {
    const out = scrubUrl(`failed to connect to ${url}: timeout`, url);
    expect(out).not.toContain("hunter2");
    expect(out).not.toContain(url);
  });
  it("removes the password on its own, raw or percent-encoded", () => {
    expect(scrubUrl("password hunter2! rejected", url)).not.toContain("hunter2");
    expect(scrubUrl("password hunter2%21 rejected", url)).not.toContain("hunter2");
  });
  it("removes a different postgres URL's password too", () => {
    expect(scrubUrl("dial postgres://u:other-secret@host/db", url)).not.toContain("other-secret");
  });
  it("leaves ordinary output alone", () => {
    expect(scrubUrl("Applying migration 2026.sql...", url)).toBe("Applying migration 2026.sql...");
  });
});
