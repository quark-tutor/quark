import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// "Is the boat here?" (lib/boat-here.ts; docs/trading-boat-2-slice.md, What is built 1). With the switch off it reads
// the switch and nothing else, so the wall, the boat and its routes behave as on main before this slice. A fault counts
// as off. On, with a setting that gives prices, it answers with the child's seed and numbers.

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
  replies = { skills: { data: rungs, error: null } };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("is the trading boat here?", () => {
  it("with the switch off, is not, and reads the switch and nothing else", async () => {
    replies.families = { data: { timezone: "Pacific/Honolulu", boat_on: false }, error: null };
    const { boatHere } = await import("./boat-here");
    expect(await boatHere(device)).toBeNull();
    expect(read).toEqual(["families"]);
  });

  it("counts a fault reading the switch as off, and says so in one line naming no child", async () => {
    replies.families = { data: null, error: { message: 'column families.boat_on does not exist' } };
    const { boatHere } = await import("./boat-here");
    expect(await boatHere(device)).toBeNull();
    expect(read).toEqual(["families"]);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(/Pip|child-1/);
  });

  it("with the switch on, is here with the child's own seed and the family's numbers", async () => {
    replies.families = { data: { timezone: "Pacific/Honolulu", boat_on: true }, error: null };
    replies.mastery = { data: places(["times-2-5-10", "done"], ["times-3-4", "working"]), error: null };
    const { boatHere } = await import("./boat-here");
    const ctx = await boatHere(device);
    expect(ctx).toMatchObject({ seed: "child-1", nb: { buy: [3, 4], usual: 4, cap: 10 } });
    expect(ctx!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("with the switch on, is not here when the tables give no prices, or prices that lose money", async () => {
    replies.families = { data: { timezone: "Pacific/Honolulu", boat_on: true }, error: null };
    const { boatHere } = await import("./boat-here");
    replies.mastery = { data: [], error: null };
    expect(await boatHere(device)).toBeNull();
    replies.mastery = { data: places(["times-2-5-10", "done"], ["times-3-4", "done"]), error: null };
    expect(await boatHere(device)).toBeNull();
  });

  it("is asked by every boat function in lib/boat.ts, and by the wall's scope, and the test view decides nothing", () => {
    const boat = readFileSync(join(__dirname, "boat.ts"), "utf8");
    for (const fn of ["boatScreen", "boatTile", "boatMove", "sayBoat"]) {
      expect(boat).toMatch(new RegExp(`export async function ${fn}[\\s\\S]*?\\n  const ctx = await boatHere\\(device\\);\\n  if \\(!ctx\\) return null;`));
    }
    expect(boat).not.toMatch(/devViewOn/);
    expect(readFileSync(join(__dirname, "wall.ts"), "utf8")).toMatch(/hide: \(await boatHere\(device\)\) \? \["puzzle"\] : \[\]/);
  });
});
