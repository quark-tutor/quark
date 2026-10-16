import { describe, expect, it } from "vitest";
import { estimate, runRow, WEEKS_PER_MONTH, type RecordedRun, type RunModel } from "./runs";

describe("runRow", () => {
  it("prices each job and model, totals what it can, and keeps only counts", () => {
    const row = runRow(
      "week:build",
      [
        { use: "curate", model: "claude-opus-5-5", calls: 5, input: 1_000_000, output: 100_000 },
        { use: "write", model: "claude-sonnet-5-5", calls: 10, input: 500_000, output: 500_000 },
      ],
      { ok: true, startedAt: new Date("2026-10-16T08:00:00Z"), themeId: "t1", week: 1, days: 1, children: 2 },
    );
    expect(row).toEqual({
      kind: "week:build",
      ok: true,
      started_at: "2026-10-16T08:00:00.000Z",
      theme_id: "t1",
      week: 1,
      days: 1,
      children: 2,
      models: [
        { use: "curate", model: "claude-opus-5-5", calls: 5, input: 1_000_000, output: 100_000, cost: 6 },
        { use: "write", model: "claude-sonnet-5-5", calls: 10, input: 500_000, output: 500_000, cost: 6 },
      ],
      cost: 12,
      cost_complete: true,
    });
  });

  it("says when a model has no known price, and leaves week fields empty for content:fetch", () => {
    const row = runRow("content:fetch", [{ use: "gate", model: "some-other-model", calls: 3, input: 10, output: 10 }], {
      ok: false,
      startedAt: new Date("2026-10-16T08:00:00Z"),
    });
    expect(row.models[0].cost).toBeNull();
    expect(row.cost).toBe(0);
    expect(row.cost_complete).toBe(false);
    expect([row.theme_id, row.week, row.days, row.children]).toEqual([null, null, null, null]);
  });

  it("records a run that made no calls as costing nothing", () => {
    const row = runRow("content:fetch", [], { ok: true, startedAt: new Date() });
    expect(row).toMatchObject({ models: [], cost: 0, cost_complete: true });
  });
});

const m = (use: RunModel["use"], cost: number | null): RunModel => ({ use, model: "x", calls: 1, input: 1, output: 1, cost });
const run = (finished: string, days: number, children: number, models: RunModel[], extra: Partial<RecordedRun> = {}): RecordedRun => ({
  kind: "week:build",
  ok: true,
  days,
  children,
  models,
  finished_at: `2026-10-${finished}T00:00:00Z`,
  ...extra,
});

describe("estimate", () => {
  it("prices ideas per day and cards per child per day, then a week and a month", () => {
    // One day for two children: ideas $0.40, cards $0.50 ($0.25 a child).
    const e = estimate([run("15", 1, 2, [m("curate", 0.4), m("write", 0.5)])], 2)!;
    expect(e.ideasPerDay).toBeCloseTo(0.4);
    expect(e.cardsPerChildDay).toBeCloseTo(0.25);
    expect(e.week).toBeCloseTo(7 * (0.4 + 2 * 0.25));
    expect(e.month).toBeCloseTo(e.week * WEEKS_PER_MONTH);
    expect(e.pricesMissing).toBe(false);
  });

  it("counts a one-child rebuild toward cards only, and ignores failed runs and content fetches", () => {
    const runs = [
      run("14", 2, 2, [m("curate", 1.0), m("write", 1.2)]), // ideas 0.50/day, cards 0.30/child-day
      run("15", 1, 1, [m("write", 0.5)]), // cards 0.50/child-day, no ideas
      run("16", 1, 2, [m("curate", 9), m("write", 9)], { ok: false }),
      run("16", 1, 2, [m("gate", 9)], { kind: "content:fetch" }),
    ];
    const e = estimate(runs, 2)!;
    expect(e.ideaRuns).toBe(1);
    expect(e.ideasPerDay).toBeCloseTo(0.5);
    expect(e.cardRuns).toBe(2);
    expect(e.cardChildDays).toBe(5);
    expect(e.cardsPerChildDay).toBeCloseTo(1.7 / 5);
  });

  it("uses only the most recent runs", () => {
    const runs = [run("10", 1, 2, [m("curate", 10), m("write", 10)]), run("15", 1, 2, [m("curate", 0.4), m("write", 0.5)])];
    expect(estimate(runs, 2, 1)!.ideasPerDay).toBeCloseTo(0.4);
  });

  it("is null until a run has built both ideas and cards, and flags unknown prices", () => {
    expect(estimate([], 2)).toBeNull();
    expect(estimate([run("15", 1, 1, [m("write", 0.5)])], 2)).toBeNull();
    expect(estimate([run("15", 1, 2, [m("curate", null), m("write", 0.5)])], 2)!.pricesMissing).toBe(true);
  });
});
