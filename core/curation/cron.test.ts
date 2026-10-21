import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blockedBy, cronFiring, dayState, nextDay, nextWeek, scrubNames, type BuiltDay, type CronDeps, type CronReply, type CronRow, type CronTarget, type DayCount, type ThemeRow } from "./cron";

// Invented children only (Pip and Wren, as gate.test.ts has).
const kids = [
  { id: "c1", nickname: "Pip" },
  { id: "c2", nickname: "Wren" },
];
const childIds = kids.map((k) => k.id);
const whole = (): DayCount => ({ ideas: 20, cards: { c1: 20, c2: 20 }, questions: { c1: 20, c2: 20 } });
const theme = (over: Partial<ThemeRow> = {}): ThemeRow => ({ id: "t1", week_start: "2026-10-26", plan_week: 1, status: "generating", ...over });

describe("nextWeek", () => {
  const none = new Set<string>();
  it("starts week 1 on the next Monday when the family has no week", () => {
    expect(nextWeek({ themes: [], own: none, today: "2026-10-25" })).toEqual({ kind: "build", week: 1, start: "2026-10-26", theme: null });
    expect(nextWeek({ themes: [], own: none, today: "2026-10-20" })).toMatchObject({ week: 1, start: "2026-10-26" }); // a Tuesday, by hand
  });

  it("goes on with the theme a firing made for that Monday", () => {
    expect(nextWeek({ themes: [theme()], own: new Set(["t1"]), today: "2026-10-25" })).toEqual({ kind: "build", week: 1, start: "2026-10-26", theme: "t1" });
  });

  it("takes the highest plan week plus one, a Sunday later", () => {
    const week1 = [theme({ status: "live" })];
    expect(nextWeek({ themes: week1, own: new Set(["t1"]), today: "2026-11-01" })).toEqual({ kind: "build", week: 2, start: "2026-11-02", theme: null });
  });

  it("after a skipped Sunday the plan goes on from the last week built, a week later in the calendar", () => {
    expect(nextWeek({ themes: [theme({ status: "live" })], own: new Set(["t1"]), today: "2026-11-08" })).toMatchObject({ week: 2, start: "2026-11-09" });
  });

  it("asks for the Monday after a Monday, not that Monday", () => {
    expect(nextWeek({ themes: [], own: none, today: "2026-10-26" })).toMatchObject({ start: "2026-11-02" });
  });

  it("refuses a week that starts then or later and that no firing is building, and never rebuilds it", () => {
    const byHand = theme({ id: "h1", week_start: "2026-11-02", plan_week: 2, status: "review" });
    expect(nextWeek({ themes: [theme({ status: "live" }), byHand], own: new Set(["t1"]), today: "2026-11-01" })).toEqual({ kind: "refuse", reason: "week 2 is already built", week: 2 });
    // A hand build left generating is not the cron's either.
    expect(nextWeek({ themes: [theme()], own: none, today: "2026-10-25" })).toMatchObject({ kind: "refuse", reason: "week 1 is already built" });
  });
});

describe("a day's state", () => {
  it("is complete only on exact counts, partial when anything is short or doubled, empty when nothing is there", () => {
    expect(dayState(undefined, childIds)).toBe("empty");
    expect(dayState({ ideas: 0, cards: {}, questions: {} }, childIds)).toBe("empty");
    expect(dayState(whole(), childIds)).toBe("complete");
    expect(dayState({ ...whole(), ideas: 15 }, childIds)).toBe("partial");
    expect(dayState({ ...whole(), cards: { c1: 20, c2: 12 } }, childIds)).toBe("partial");
    expect(dayState({ ...whole(), questions: { c1: 20 } }, childIds)).toBe("partial"); // a card without its question
    expect(dayState({ ideas: 40, cards: { c1: 40, c2: 40 }, questions: { c1: 40, c2: 40 } }, childIds)).toBe("partial"); // written twice
  });

  it("picks the earliest day that is not complete, and whether it must be cleared", () => {
    const counts = new Map<number, DayCount>([
      [1, whole()],
      [2, whole()],
      [3, { ...whole(), cards: { c1: 8, c2: 0 } }],
    ]);
    expect(nextDay(counts, childIds)).toEqual({ day: 3, rebuild: true });
    counts.delete(3);
    expect(nextDay(counts, childIds)).toEqual({ day: 3, rebuild: false });
    for (let d = 3; d <= 7; d++) counts.set(d, whole());
    expect(nextDay(counts, childIds)).toBeNull();
  });
});

describe("the lock", () => {
  const row = (id: string, minute: number, target: Partial<CronTarget>): CronRow => ({
    id,
    created_at: new Date(Date.parse("2026-10-25T16:00:00Z") + minute * 60_000).toISOString(),
    target: { outcome: "started", week: 1, day: 3, theme: "t1", ...target },
  });

  it("stops a firing when an earlier one for the same week and day has not ended", () => {
    const rows = [row("a", 0, {}), row("b", 1, {})];
    expect(blockedBy(rows, "b", 1, 3)?.id).toBe("a");
    expect(blockedBy(rows, "a", 1, 3)).toBeNull(); // the earliest goes on
  });

  it("is not held by a firing that has ended, nor by another day or another week", () => {
    const ended = [row("a", 0, {}), row("a1", 0.5, { outcome: "failed", started: "a" }), row("b", 1, {})];
    expect(blockedBy(ended, "b", 1, 3)).toBeNull();
    expect(blockedBy([row("a", 0, { day: 2 }), row("b", 1, {})], "b", 1, 3)).toBeNull();
    expect(blockedBy([row("a", 0, { week: 2 }), row("b", 1, {})], "b", 1, 3)).toBeNull();
  });

  it("breaks a tie on the id, the same way for both firings", () => {
    const rows = [row("b", 0, {}), row("a", 0, {})];
    expect(blockedBy(rows, "b", 1, 3)?.id).toBe("a");
    expect(blockedBy(rows, "a", 1, 3)).toBeNull();
  });
});

describe("scrubNames", () => {
  it("takes a nickname out wherever it stands alone, in any case, and leaves longer words", () => {
    expect(scrubNames(`Unexpected token 'P', "Pip's card" is not valid JSON; WREN too`, ["Pip", "Wren"])).toBe(`Unexpected token 'P', "[child]'s card" is not valid JSON; [child] too`);
    expect(scrubNames("The pipe burst in the wrench shop", ["Pip", "Wren"])).toBe("The pipe burst in the wrench shop");
    expect(scrubNames("Mary-Ann (the elder)", ["Mary-Ann"])).toBe("[child] (the elder)");
  });
});

// A firing against a small world: an in-memory audit log, themes and day counts, and a build that adds a day.
function world(over: { themes?: ThemeRow[]; own?: string[]; families?: { id: string; timezone: string }[]; env?: string | null; library?: string | null; prepareError?: string; gate?: string | null; buildError?: string; built?: Partial<BuiltDay>; gateResult?: { problem: string } | { passed: number; heldBack: number; pending: number; cost: number }; at?: string } = {}) {
  let clock = Date.parse(over.at ?? "2026-10-25T16:00:00Z");
  let n = 0;
  const log: CronRow[] = (over.own ?? []).map((id) => ({ id: `seed-${id}`, created_at: "2026-10-01T00:00:00Z", target: { outcome: "theme" as const, week: 1, day: 1, theme: id } }));
  const themes: ThemeRow[] = over.themes ?? [];
  const counts = new Map<string, Map<number, DayCount>>();
  const calls = { build: [] as { day: number; rebuild: boolean }[], prepare: 0, gate: 0 };
  const deps: CronDeps<string> = {
    now: () => new Date(clock),
    families: async () => over.families ?? [{ id: "f1", timezone: "Pacific/Honolulu" }],
    children: async () => kids,
    themes: async () => themes.map((t) => ({ ...t })),
    ownThemes: async () => new Set(log.filter((r) => r.target.outcome === "theme").map((r) => r.target.theme!)),
    counts: async (id) => new Map(counts.get(id) ?? []),
    recentRows: async (_family, since) => log.filter((r) => Date.parse(r.created_at) >= since.getTime()),
    audit: async (_family, target) => {
      const id = `a${++n}`;
      clock += 1000;
      log.push({ id, created_at: new Date(clock).toISOString(), target });
      return id;
    },
    envProblem: () => over.env ?? null,
    prepare: async (week) => {
      calls.prepare += 1;
      if (over.library) throw new Error(over.library);
      if (over.prepareError) throw new Error(over.prepareError);
      return `week-${week}`;
    },
    gateProblem: () => over.gate ?? null,
    build: async (_prepared, run) => {
      calls.build.push({ day: run.day, rebuild: run.rebuild });
      clock += 180_000; // a day takes about three minutes
      let t = themes.find((x) => log.some((r) => r.target.outcome === "theme" && r.target.theme === x.id));
      if (!t) {
        t = theme({ id: "t-new" });
        themes.push(t);
        await run.onTheme(t.id);
      }
      if (over.buildError) throw new Error(over.buildError);
      const days = counts.get(t.id) ?? new Map<number, DayCount>();
      days.set(run.day, whole());
      counts.set(t.id, days);
      if (days.size === 7) t.status = "review";
      return { theme: t.id, passed: 40, heldBack: 0, pending: 0, cost: 1.9, gateError: null, ...over.built };
    },
    gatePending: async () => {
      calls.gate += 1;
      return over.gateResult ?? { passed: 0, heldBack: 0, pending: 0, cost: 0 };
    },
  };
  return { deps, log, themes, counts, calls, at: (iso: string) => void (clock = Date.parse(iso)), advance: (ms: number) => void (clock += ms) };
}
const fire = (w: ReturnType<typeof world>) => cronFiring(w.deps, { schedule: "0 16 * * 0" });
const outcomes = (w: ReturnType<typeof world>) => w.log.filter((r) => !r.id.startsWith("seed-")).map((r) => r.target.outcome);

describe("a firing", () => {
  it("builds day 1 of week 1 on the first Sunday and records the start, the theme it made and how it ended", async () => {
    const w = world();
    const reply = await fire(w);
    expect(reply).toMatchObject({ outcome: "built", week: 1, day: 1, theme: "t-new", cost: 1.9, seconds: 183 });
    expect(w.calls.build).toEqual([{ day: 1, rebuild: false }]);
    expect(outcomes(w)).toEqual(["started", "theme", "built"]);
    const [started, made, built] = w.log;
    expect(started.target).toMatchObject({ week: 1, day: 1, theme: null, schedule: "0 16 * * 0" });
    expect(made.target).toMatchObject({ started: started.id, theme: "t-new" });
    expect(built.target).toMatchObject({ started: started.id, week: 1, day: 1, theme: "t-new", passed: 40, held_back: 0, pending: 0, cost: 1.9 });
  });

  it("builds the week a day a firing across the Sunday, puts it in review after day 7, and then does nothing", async () => {
    const w = world({ gateResult: { passed: 0, heldBack: 0, pending: 0, cost: 0 } });
    const replies: CronReply[] = [];
    for (const hour of ["16", "18", "20", "22"]) {
      w.at(`2026-10-25T${hour}:05:00Z`);
      replies.push(await fire(w));
    }
    for (const hour of ["00", "02", "04"]) {
      w.at(`2026-10-26T${hour}:05:00Z`); // Monday in UTC, still Sunday in Hawaii
      replies.push(await fire(w));
    }
    expect(replies.map((r) => [r.outcome, r.week, r.day])).toEqual([1, 2, 3, 4, 5, 6, 7].map((d) => ["built", 1, d]));
    expect(w.themes[0].status).toBe("review");
    w.at("2026-10-26T06:05:00Z"); // the 8 pm spare
    const spare = await fire(w);
    expect(spare).toMatchObject({ outcome: "nothing", week: 1, day: null, reason: "all seven days of week 1 are built" });
    expect(w.calls.build).toHaveLength(7);
    expect(w.calls.gate).toBe(1); // it still checks what an earlier firing left pending
  });

  it("names no child in any row or reply", async () => {
    const w = world({ buildError: `Unexpected token 'P', "Pip and Wren" is not valid JSON` });
    const failed = await fire(w);
    const ok = world({ gateResult: { passed: 0, heldBack: 0, pending: 0, cost: 0 } });
    const replies = [failed, await fire(ok), await fire(ok)];
    expect(JSON.stringify([w.log, ok.log, replies])).not.toMatch(/Pip|Wren/);
  });

  describe("refuses before spending anything", () => {
    const refusedTwice = (w: ReturnType<typeof world>) => {
      expect(outcomes(w)).toEqual(["started", "refused"]);
      expect(w.calls.build).toEqual([]);
    };

    it("a week already built by hand", async () => {
      const w = world({ themes: [theme({ status: "review" })] });
      expect(await fire(w)).toMatchObject({ outcome: "refused", week: 1, reason: "week 1 is already built" });
      refusedTwice(w);
      expect(w.calls.prepare).toBe(0);
    });

    it("a library that cannot fill the week", async () => {
      const w = world({ library: "Not enough short lessons for week 2: the look card needs 7 and 0 are left; the puzzle card needs 7 and 3 are left. Add lessons to plan/short-lessons.yaml and run npm run plan:import." });
      const reply = await fire(w);
      expect(reply).toMatchObject({ outcome: "refused" });
      expect(reply.reason).toMatch(/^Not enough short lessons for week 2: the look card needs 7 and 0 are left/);
      refusedTwice(w);
    });

    it("a gate that cannot run", async () => {
      const w = world({ gate: "the saved rulebook is older than the family's answers: open /parent/beliefs/rulebook once so it saves" });
      expect(await fire(w)).toMatchObject({ outcome: "refused", reason: expect.stringMatching(/older than the family's answers/) });
      refusedTwice(w);
    });

    it("a model name or the key missing, checked before the library is read", async () => {
      const w = world({ env: "QUARK_MODEL_GATE isn't set where the build runs", library: "Not enough short lessons for week 1" });
      expect(await fire(w)).toMatchObject({ outcome: "refused", reason: "QUARK_MODEL_GATE isn't set where the build runs" });
      refusedTwice(w);
      expect(w.calls.prepare).toBe(0);
    });

    it("another firing already working on the same day", async () => {
      const w = world();
      w.log.push({ id: "a0", created_at: new Date(Date.parse("2026-10-25T15:58:00Z")).toISOString(), target: { outcome: "started", week: 1, day: 1, theme: null } });
      expect(await fire(w)).toMatchObject({ outcome: "refused", reason: "another firing is working on day 1 of week 1" });
      expect(outcomes(w)).toEqual(["started", "started", "refused"]); // the earlier firing's row, then this one's two
      expect(w.calls.build).toEqual([]);
    });

    it("more or fewer than one family, with nothing to record it in", async () => {
      const w = world({ families: [] });
      expect(await fire(w)).toMatchObject({ outcome: "refused", reason: "expected one family, found 0" });
      expect(w.log).toEqual([]);
      const two = world({ families: [{ id: "f1", timezone: "UTC" }, { id: "f2", timezone: "UTC" }] });
      expect((await fire(two)).reason).toBe("expected one family, found 2");
      expect(two.log).toEqual([]);
    });
  });

  it("is not held by an earlier firing that ended, so a hand retry after a failure goes straight on", async () => {
    const w = world({ buildError: "the model is down" });
    expect((await fire(w)).outcome).toBe("failed");
    const retry = world();
    retry.log.push(...w.log);
    retry.themes.push(...w.themes);
    retry.advance(30_000);
    expect(await fire(retry)).toMatchObject({ outcome: "built", day: 1 });
  });

  it("goes on into the theme a stopped day 1 made, and clears and rebuilds a half-built day", async () => {
    const w = world({ themes: [theme()], own: ["t1"] });
    w.counts.set("t1", new Map<number, DayCount>([[1, whole()], [2, { ...whole(), cards: { c1: 20, c2: 5 } }]]));
    expect(await fire(w)).toMatchObject({ outcome: "built", week: 1, day: 2 });
    expect(w.calls.build).toEqual([{ day: 2, rebuild: true }]);

    const stopped = world({ themes: [theme()], own: ["t1"] }); // day 1 never wrote an idea
    expect(await fire(stopped)).toMatchObject({ outcome: "built", day: 1 });
    expect(stopped.calls.build).toEqual([{ day: 1, rebuild: false }]);
  });

  it("clears and rebuilds a day that was written twice", async () => {
    const w = world({ themes: [theme()], own: ["t1"] });
    w.counts.set("t1", new Map<number, DayCount>([[1, { ideas: 40, cards: { c1: 40, c2: 40 }, questions: { c1: 40, c2: 40 } }]]));
    await fire(w);
    expect(w.calls.build).toEqual([{ day: 1, rebuild: true }]);
  });

  it("builds nothing when another firing built the day between its read and its lock", async () => {
    const w = world({ themes: [theme()], own: ["t1"] });
    w.counts.set("t1", new Map<number, DayCount>([[1, whole()]]));
    const recent = w.deps.recentRows;
    w.deps.recentRows = async (family, since) => {
      w.counts.get("t1")!.set(2, whole()); // the other firing finishes day 2 now
      return recent(family, since);
    };
    expect(await fire(w)).toMatchObject({ outcome: "nothing", day: 2, reason: "day 2 of week 1 was built by another firing" });
    expect(w.calls.build).toEqual([]);
  });

  it("leaves a week that is already live alone", async () => {
    const w = world({ themes: [theme({ status: "live" })], own: ["t1"] });
    expect(await fire(w)).toMatchObject({ outcome: "nothing", reason: "week 1 is already live" });
    expect(w.calls.build).toEqual([]);
    expect(w.calls.gate).toBe(0);
  });

  it("records a failure with the text taken out of any nickname, and ends as failed", async () => {
    const w = world({ buildError: `Unexpected token 'P', "Pip's card" is not valid JSON` });
    const reply = await fire(w);
    expect(reply.outcome).toBe("failed");
    const failed = w.log.at(-1)!;
    expect(failed.target).toMatchObject({ outcome: "failed", error: `Unexpected token 'P', "[child]'s card" is not valid JSON` });
    expect(outcomes(w)).toEqual(["started", "theme", "failed"]);
  });

  it("fails, rather than refuses, on a library error that isn't a short library", async () => {
    const w = world({ prepareError: "plan_topics: connection reset" });
    expect((await fire(w)).outcome).toBe("failed");
    expect(w.calls.build).toEqual([]);
  });

  it("records a gate that stopped, scrubbed, on a build that otherwise finished", async () => {
    const w = world({ built: { pending: null, gateError: "cards: Wren's connection reset" } });
    expect(await fire(w)).toMatchObject({ outcome: "built" });
    expect(w.log.at(-1)!.target).toMatchObject({ pending: null, gate_error: "cards: [child]'s connection reset" });
  });

  it("refuses an all-built week's gate when the gate can't run, and says nothing else", async () => {
    const w = world({ themes: [theme({ status: "review" })], own: ["t1"], gateResult: { problem: "the family has no rulebook yet" } });
    w.counts.set("t1", new Map([1, 2, 3, 4, 5, 6, 7].map((d) => [d, whole()] as const)));
    expect(await fire(w)).toMatchObject({ outcome: "refused", reason: "the family has no rulebook yet" });
  });
});

describe("vercel.json", () => {
  const vercel = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8")) as { crons: { path: string; schedule: string }[] };

  it("has the eight Sunday firings, once each, two hours apart in Hawaii time, on one path", () => {
    const hawaii = vercel.crons.map((c) => {
      const m = c.schedule.match(/^0 (\d{1,2}) \* \* ([01])$/); // one fixed hour on one fixed day: valid on Hobby
      expect(m, c.schedule).not.toBeNull();
      const utc = Number(m![1]);
      return { weekday: utc < 10 ? (Number(m![2]) + 6) % 7 : Number(m![2]), hour: (utc - 10 + 24) % 24 }; // Hawaii is UTC-10 all year
    });
    expect(hawaii).toEqual([6, 8, 10, 12, 14, 16, 18, 20].map((hour) => ({ weekday: 0, hour })));
    expect(new Set(vercel.crons.map((c) => c.path))).toEqual(new Set(["/api/cron/week"]));
    expect(new Set(vercel.crons.map((c) => c.schedule)).size).toBe(8);
  });

  it("points at a route that stops at five minutes, the Hobby limit", () => {
    expect(readFileSync(new URL("../../app/api/cron/week/route.ts", import.meta.url), "utf8")).toMatch(/export const maxDuration = 300;/);
  });
});
