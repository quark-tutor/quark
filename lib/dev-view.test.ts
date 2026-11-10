import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));

// The test view (lib/dev-view.ts) is on only on the dev server against the test database: never on Vercel, never live.
describe("the test view", () => {
  it("is on only for the dev server against test", async () => {
    const { devViewOn } = await import("./dev-view");
    expect(devViewOn({ NODE_ENV: "development", QUARK_TARGET: "test" })).toBe(true);
    expect(devViewOn({ NODE_ENV: "production", QUARK_TARGET: "test" })).toBe(false);
    expect(devViewOn({ NODE_ENV: "development", QUARK_TARGET: "live" })).toBe(false);
    expect(devViewOn({ NODE_ENV: "production", QUARK_TARGET: "live" })).toBe(false);
    expect(devViewOn({})).toBe(false);
  });

  it("guards every way in: the switch route answers 404 and the bar renders nothing when it is off", () => {
    const route = readFileSync(join(__dirname, "..", "app", "kid", "dev", "route.ts"), "utf8");
    expect(route).toMatch(/if \(!devViewOn\(\)\) return new NextResponse\(null, \{ status: 404 \}\);/);
    const lib = readFileSync(join(__dirname, "dev-view.ts"), "utf8");
    for (const fn of ["devDay", "devFamily", "devSwitchChild"]) expect(lib).toMatch(new RegExp(`export async function ${fn}[\\s\\S]*?\\n  if \\(!devViewOn\\(\\)\\) return`));
  });
});
