import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// "Is the boat here?" (lib/boat-here.ts; docs/trading-boat-2-slice.md, as changed at stop 2's fix round). There is no
// switch (Brandon, 17 Nov 2026): the boat is here whenever the family's times tables give the child prices, on test and
// on live alike, and with no table set it is not, and the wall shows Puzzle. A fault counts as not here.

type Reply = { data: unknown; error: { message: string } | null };
let read: string[] = [];
let replies: Record<string, Reply> = {};

// A query builder that records the table it was asked for and answers that table's reply, however it is filtered.
function query(table: string) {
  read.push(table);
  const reply = replies[table] ?? { data: [], error: null };
  const q: Record<string, unknown> = {};
  for (const m of ["select", "eq", "not", "single", "maybeSingle", "order", "in"]) q[m] = () => q;
  q.then = (ok: (r: Reply) => unknown, no?: (e: unknown) => unknown) => Promise.resolve(reply).then(ok, no);
  return q;
}

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: (t: string) => query(t) }) }));

const device = { id: "device-1", familyId: "family-1", childId: "child-1", nickname: "Pip" };
const rungs = [
  { key: "times-2-5-10", ladder: { rule: { op: "x", by: [2, 5, 10], each: 12 } } },
  { key: "times-3-4", ladder: { rule: { op: "x", by: [3, 4], each: 12 } } },
  { key: "times-6-9", ladder: { rule: { op: "x", by: [6, 7, 8, 9], each: 12 } } },
];
const places = (...p: [string, string][]) => p.map(([key, place]) => ({ place, skills: { key } }));

beforeEach(() => {
  read = [];
  replies = { skills: { data: rungs, error: null }, families: { data: { timezone: "Pacific/Honolulu" }, error: null } };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("is the trading boat here?", () => {
  it("with no times table set, is not, and the wall shows Puzzle", async () => {
    replies.mastery = { data: [], error: null };
    const { boatHere } = await import("./boat-here");
    expect(await boatHere(device)).toBeNull();
  });

  it("with tables that give prices, is here with the child's own seed and the family's numbers, with no switch read", async () => {
    replies.mastery = { data: places(["times-2-5-10", "done"], ["times-3-4", "working"]), error: null };
    const { boatHere } = await import("./boat-here");
    const ctx = await boatHere(device);
    expect(ctx).toMatchObject({ seed: "child-1", nb: { buy: [3, 4], usual: 4, cap: 10 } });
    expect(ctx!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(read.sort()).toEqual(["families", "mastery", "skills"]);
  });

  it("is not here when the tables give prices that lose money", async () => {
    replies.mastery = { data: places(["times-2-5-10", "done"], ["times-3-4", "done"]), error: null };
    const { boatHere } = await import("./boat-here");
    expect(await boatHere(device)).toBeNull();
  });

  it("counts a fault reading anything as not here, and says so in one line naming no child", async () => {
    const { boatHere } = await import("./boat-here");
    for (const table of ["families", "skills", "mastery"]) {
      vi.mocked(console.error).mockClear();
      replies.mastery = { data: places(["times-2-5-10", "working"]), error: null };
      replies.families = { data: { timezone: "Pacific/Honolulu" }, error: null };
      replies.skills = { data: rungs, error: null };
      replies[table] = { data: null, error: { message: `relation ${table} could not be read` } };
      expect(await boatHere(device)).toBeNull();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(/Pip|child-1/);
    }
  });

  it("is asked by every boat function in lib/boat.ts, and by the wall's scope, and the test view decides nothing", () => {
    const boat = readFileSync(join(__dirname, "boat.ts"), "utf8");
    for (const fn of ["boatScreen", "boatTile", "boatMove", "sayBoat"]) {
      expect(boat).toMatch(new RegExp(`export async function ${fn}[\\s\\S]*?\\n  const ctx = await boatHere\\(device\\);\\n  if \\(!ctx\\) return null;`));
    }
    expect(boat).not.toMatch(/devViewOn/);
    expect(readFileSync(join(__dirname, "wall.ts"), "utf8")).toMatch(/hide: \(await boatHere\(device\)\) \? \["puzzle"\] : \[\]/);
  });

  it("has no switch: no code reads families.boat_on, and /parent has no button for it", () => {
    const root = join(__dirname, "..");
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx|mts)$/.test(f) && !f.endsWith(".test.ts") ? [p] : [];
      });
    for (const p of ["app", "lib", "core", "scripts"].flatMap((d) => files(join(root, d)))) {
      expect(readFileSync(p, "utf8"), p).not.toMatch(/boat_on|setBoat\b|boat-switch/);
    }
  });
});
