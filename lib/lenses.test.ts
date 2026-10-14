import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LENS_QUESTIONS, LENSES, openingLens, pickLenses, priorStrength, SHARED, type Lens, type LensInput, type LensPick } from "./lenses";

const count = (picks: LensPick[]) => {
  const c = Object.fromEntries(LENSES.map((l) => [l, 0])) as Record<Lens, number>;
  for (const p of picks) c[p.lens] += 1;
  return c;
};
const week = (input: Partial<LensInput>) => pickLenses({ sex: "boy", pilotWeek: 1, history: {}, days: 7, ...input });

describe("pickLenses, week one", () => {
  const boy = week({ sex: "boy" });
  const girl = week({ sex: "girl" });
  const unset = week({ sex: null });

  it("gives every day-slot one lens", () => {
    expect(boy).toHaveLength(35);
    expect(new Set(boy.map((p) => `${p.day}:${p.slot}`)).size).toBe(35);
  });

  it("is carried by the shared lenses, with the prior's lens beside them", () => {
    for (const picks of [boy, girl, unset]) {
      const c = count(picks);
      const shared = SHARED.reduce((s, l) => s + c[l], 0);
      expect(shared).toBeGreaterThan(picks.length / 2);
    }
    const b = count(boy);
    const g = count(girl);
    expect(b.build).toBeGreaterThanOrEqual(Math.min(...SHARED.map((l) => b[l])));
    expect(b.build).toBeGreaterThan(b.care);
    expect(g.care).toBeGreaterThan(g.build);
    expect(count(unset).build).toBe(count(unset).care);
  });

  it("never withholds a lens: all seven appear for every child, whatever the sex", () => {
    for (const picks of [boy, girl, unset]) expect(Object.values(count(picks)).every((n) => n >= 1)).toBe(true);
  });

  it("opens with a shared lens when there's no history", () => {
    expect(boy[0]).toEqual({ day: 1, slot: "look", lens: "explore" });
    expect(girl[0].lens).toBe("explore");
  });

  it("shows at least four lenses even in a one-day week, and doesn't repeat one within a day", () => {
    const one = week({ days: 1 });
    expect(new Set(one.map((p) => p.lens)).size).toBeGreaterThanOrEqual(4);
    for (let day = 1; day <= 7; day++) {
      const lenses = boy.filter((p) => p.day === day).map((p) => p.lens);
      expect(new Set(lenses).size).toBe(lenses.length);
    }
  });

  it("is the same every time for the same child", () => {
    expect(week({ sex: "boy" })).toEqual(boy);
  });
});

describe("pickLenses, from week two", () => {
  const builder = { build: 9, story: 2, explore: 3 };
  const reader = { story: 8, care: 5, humor: 1 };

  it("opens with the strongest lens", () => {
    expect(week({ pilotWeek: 2, history: builder })[0].lens).toBe("build");
    expect(week({ pilotWeek: 4, sex: "girl", history: { compete: 6, care: 1 } })[0].lens).toBe("compete");
  });

  it("every third week opens with the least-chosen lens instead", () => {
    expect(openingLens({ pilotWeek: 3, history: builder })).toBe("compete"); // no taps; first in lens order
    expect(openingLens({ pilotWeek: 6, history: { build: 1, story: 1, compete: 1, collect: 1, explore: 1, care: 1, humor: 0 } })).toBe("humor");
    expect(openingLens({ pilotWeek: 4, history: builder })).toBe("build");
  });

  it("gives the child's chosen lenses more of the week, and still shows all seven", () => {
    const c = count(week({ pilotWeek: 3, history: builder }));
    expect(c.build).toBe(Math.max(...Object.values(c)));
    expect(Object.values(c).every((n) => n >= 1)).toBe(true);
  });

  it("follows the child, not the sex: a boy who chooses story gets story", () => {
    const c = count(week({ sex: "boy", pilotWeek: 3, history: reader }));
    expect(c.story).toBeGreaterThan(c.build);
    expect(c.care).toBeGreaterThan(c.build);
  });

  it("gives two children with different histories different weeks", () => {
    const a = week({ pilotWeek: 2, history: builder });
    const b = week({ pilotWeek: 2, history: reader });
    expect(a).not.toEqual(b);
    expect(a[0].lens).toBe("build");
    expect(b[0].lens).toBe("story");
  });

  it("fades the prior over about two weeks", () => {
    expect([1, 2, 3, 4].map(priorStrength)).toEqual([1, 0.5, 0, 0]);
    const w1 = count(week({ pilotWeek: 1 }));
    const w3 = count(week({ pilotWeek: 3 }));
    expect(w3.build).toBeLessThan(w1.build);
  });
});

describe("LENS_QUESTIONS", () => {
  it("matches the opening questions in docs/17", () => {
    const doc = readFileSync(join(__dirname, "..", "docs", "17-lenses.md"), "utf8");
    for (const lens of LENSES) expect(doc).toContain(`(\`${lens}\`) | ${LENS_QUESTIONS[lens]} |`);
  });
});
