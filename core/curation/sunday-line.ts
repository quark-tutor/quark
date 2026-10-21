// What /parent says about the Sunday build, from the week.cron rows the firings left (core/curation/cron.ts):
// one line on this Sunday's build, and which week is ready to read. So a guardian is never guessing on
// Monday. No email and no notification (decided 20 Oct 2026); nothing in a row names a child. Pure.

import type { CronRow } from "./cron.ts";
import { clockTime } from "./live.ts";
import { DAYS_IN_WEEK } from "./schedule.ts";
import { todayIn } from "./week.ts";

const ENDS = new Set(["built", "nothing", "refused", "failed"]);
const dayMs = 86_400_000;

// A refusal's reason as a sentence in the middle of a line: without the instruction aimed at whoever runs Quark.
const tidy = (reason: string) => {
  const cut = reason.replace(/\.? Add lessons to .*$/, "").replace(/\.$/, "");
  return /^[A-Z][a-z]/.test(cut) ? cut[0].toLowerCase() + cut.slice(1) : cut;
};

// The line for the latest Sunday that has firings, if it was in the last week; null otherwise.
export function sundayLine(rows: CronRow[], timeZone: string, now: Date): string | null {
  const starts = rows.filter((r) => r.target.outcome === "started").sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  if (starts.length === 0) return null;
  const dateOf = (iso: string) => todayIn(timeZone, new Date(iso));
  const sunday = dateOf(starts.at(-1)!.created_at);
  if ((Date.parse(todayIn(timeZone, now)) - Date.parse(sunday)) / dayMs > 7) return null;

  const firings = starts
    .filter((r) => dateOf(r.created_at) === sunday)
    .map((start) => ({ start, end: rows.find((r) => r.target.started === start.id && ENDS.has(r.target.outcome)) }));
  const ended = (outcome: string) => firings.filter((f) => f.end?.target.outcome === outcome) as { start: CronRow; end: CronRow }[];
  const built = ended("built");
  const week = firings.map((f) => f.start.target.week).find((w) => w !== null && w !== undefined) ?? null;
  const hour = (iso: string) => clockTime(iso, timeZone, false);

  if (built.length === 0) {
    const refused = ended("refused")[0];
    if (refused) return `Sunday's build refused at ${clockTime(refused.end.created_at, timeZone)}: ${tidy(String(refused.end.target.reason ?? "no reason was recorded"))}. Nothing was spent.`;
    const failed = ended("failed")[0];
    if (failed) return `Sunday's build failed at ${clockTime(failed.end.created_at, timeZone)}: ${String(failed.end.target.error ?? "no reason was recorded")}.`;
    const nothing = ended("nothing")[0];
    if (nothing) return `Sunday's build had nothing to do: ${tidy(String(nothing.end.target.reason ?? "nothing was left to build"))}.`;
    return `Sunday's build started at ${clockTime(firings[0].start.created_at, timeZone)} and didn't finish.`;
  }

  const days = new Set(built.map((f) => f.end.target.day));
  const cost = built.reduce((sum, f) => sum + Number(f.end.target.cost ?? 0), 0);
  const last = built.map((f) => f.end.created_at).sort().at(-1)!;
  const issues = [
    ...firings.filter((f) => !f.end).map((f) => `the ${hour(f.start.created_at)} firing didn't finish`),
    ...ended("failed").map((f) => `the ${hour(f.start.created_at)} firing failed`),
  ];
  return (
    `Sunday's build: week ${week ?? "?"}, ${days.size} of ${DAYS_IN_WEEK} days` +
    (days.size === DAYS_IN_WEEK ? `, ready at ${clockTime(last, timeZone)}` : "") +
    (cost > 0 ? `, $${cost.toFixed(2)}` : "") +
    (issues.length ? `; ${issues.join("; ")}` : "") +
    "."
  );
}

// The week that is ready to read and starts after today, the nearest one.
export function readyWeek<T extends { week_start: string; status: string }>(themes: T[], today: string): T | null {
  return themes.filter((t) => t.status === "review" && t.week_start > today).sort((a, b) => a.week_start.localeCompare(b.week_start))[0] ?? null;
}
