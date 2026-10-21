import { describe, expect, it } from "vitest";
import type { CronRow, CronTarget } from "./cron";
import { readyWeek, sundayLine } from "./sunday-line";

const TZ = "Pacific/Honolulu";
// Sunday 25 October 2026 in Hawaii is UTC+10 hours: 6 am there is 16:00Z the same day.
const at = (hawaiiHour: number, minute = 0, date = "2026-10-25") => new Date(Date.parse(`${date}T00:00:00Z`) + (hawaiiHour + 10) * 3_600_000 + minute * 60_000).toISOString();

let n = 0;
const row = (created_at: string, target: Partial<CronTarget>): CronRow => ({ id: `r${++n}`, created_at, target: { outcome: "started", week: 2, day: null, theme: null, ...target } });
// A firing: its started row, and its end.
function firing(hour: number, day: number | null, end: Partial<CronTarget> | null, endMinute = 4): CronRow[] {
  const start = row(at(hour), { outcome: "started", day });
  return end ? [start, row(at(hour, endMinute), { week: 2, day, started: start.id, ...end })] : [start];
}
const now = new Date(at(21, 0)); // Sunday evening

describe("Sunday's build, in a line", () => {
  it("says the week is ready, when, and what it cost", () => {
    // The 6 am to 6 pm firings each build a day; the last ends at 6:04 pm.
    const rows = [6, 8, 10, 12, 14, 16, 18].flatMap((hour, i) => firing(hour, i + 1, { outcome: "built", cost: i === 6 ? 1.86 : 1.75 }, i === 6 ? 4 : 3));
    expect(sundayLine(rows, TZ, now)).toBe("Sunday's build: week 2, 7 of 7 days, ready at 6:04 pm, $12.36.");
  });

  it("says which firing didn't finish, and how far it got", () => {
    const rows = [...firing(6, 1, { outcome: "built", cost: 1.9 }), ...firing(8, 2, { outcome: "built", cost: 1.9 }), ...firing(10, 3, null), ...firing(12, 3, { outcome: "built", cost: 1.9 })];
    expect(sundayLine(rows, TZ, now)).toBe("Sunday's build: week 2, 3 of 7 days, $5.70; the 10 am firing didn't finish.");
  });

  it("names a firing that failed", () => {
    const rows = [...firing(6, 1, { outcome: "built", cost: 1.9 }), ...firing(8, 2, { outcome: "failed", error: "the model call failed" })];
    expect(sundayLine(rows, TZ, now)).toBe("Sunday's build: week 2, 1 of 7 days, $1.90; the 8 am firing failed.");
  });

  it("explains a refusal in plain words and says nothing was spent, without the instruction for whoever runs Quark", () => {
    const rows = firing(6, null, {
      outcome: "refused",
      reason: "Not enough short lessons for week 2: the look card needs 7 and 0 are left. Add lessons to plan/short-lessons.yaml and run npm run plan:import.",
    }, 2);
    expect(sundayLine(rows, TZ, now)).toBe("Sunday's build refused at 6:02 am: not enough short lessons for week 2: the look card needs 7 and 0 are left. Nothing was spent.");
    // An environment name is not lowercased.
    expect(sundayLine(firing(6, null, { outcome: "refused", reason: "QUARK_MODEL_GATE isn't set where the build runs" }, 2), TZ, now)).toContain("refused at 6:02 am: QUARK_MODEL_GATE isn't set");
  });

  it("says when every day was already built, and when a firing only started", () => {
    expect(sundayLine(firing(20, null, { outcome: "nothing", reason: "all seven days of week 2 are built" }, 1), TZ, now)).toBe("Sunday's build had nothing to do: all seven days of week 2 are built.");
    expect(sundayLine(firing(6, 1, null), TZ, now)).toBe("Sunday's build started at 6:00 am and didn't finish.");
  });

  it("reads only the latest Sunday, and nothing once it is more than a week old", () => {
    const old = firing(6, 1, { outcome: "built", cost: 1.9 }).map((r) => ({ ...r, created_at: at(6, 0, "2026-10-18") }));
    const latest = firing(6, 1, { outcome: "built", cost: 2 });
    expect(sundayLine([...old, ...latest], TZ, now)).toBe("Sunday's build: week 2, 1 of 7 days, $2.00.");
    expect(sundayLine(latest, TZ, new Date(at(12, 0, "2026-11-02")))).toBeNull();
    expect(sundayLine([], TZ, now)).toBeNull();
  });

  it("counts a firing at 8 pm Hawaii, which is Monday in UTC, as Sunday", () => {
    const rows = firing(20, null, { outcome: "nothing", reason: "all seven days of week 2 are built" }, 1);
    expect(rows[0].created_at.startsWith("2026-10-26")).toBe(true);
    expect(sundayLine(rows, TZ, now)).toContain("nothing to do");
  });
});

describe("the week that is ready", () => {
  const theme = (week_start: string, status: string) => ({ id: week_start, week_start, status });
  it("is the nearest week in review that starts after today", () => {
    const themes = [theme("2026-10-19", "review"), theme("2026-11-02", "review"), theme("2026-10-26", "live"), theme("2026-10-26", "review")];
    expect(readyWeek(themes, "2026-10-25")?.id).toBe("2026-10-26");
    expect(readyWeek(themes, "2026-11-03")).toBeNull();
  });
});
