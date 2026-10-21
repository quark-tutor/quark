// The Sunday build's own logic (docs/looks-good-slice.md, decision 1, as amended by the plan-mode review of
// 20 Oct 2026): which week and which day the next firing builds, whether another firing already has it,
// and what a firing records. Pure: the database, the clock and the build are passed in as CronDeps, the way
// buildWeek takes its own, so every refusal is tested without a database or a model. The real deps are
// core/curation/cron-job.ts; the route is app/api/cron/week/route.ts.
//
// Vercel's delivery is best effort: a firing can be missed or, now and then, delivered twice, and a
// firing is stopped at five minutes. So a firing records itself in audit_log (action week.cron, no
// guardian), takes a lock out of those rows, and only ever builds the earliest day that is not complete.

import { faultText } from "./gate.ts";
import { DAYS_IN_WEEK } from "./schedule.ts";
import { nextMonday, todayIn } from "./week.ts";

export const CRON_ACTION = "week.cron";
export const LOCK_MINUTES = 10; // longer than the five minutes a firing may run
export const IDEAS_A_DAY = 20; // five slots, four layers
export const CARDS_A_DAY = 20; // per child: one card for each idea, and one question for each card

// --- Which week ---

export type ThemeRow = { id: string; week_start: string; plan_week: number | null; status: string };

export type NextWeek =
  | { kind: "build"; week: number; start: string; theme: string | null } // theme: the cron's own, to add a day to
  | { kind: "refuse"; reason: string; week: number | null };

// Next week is the Monday after today where the family lives (04:00 UTC on a Monday is still Sunday in
// Hawaii). If the cron already has a theme starting then, this firing adds to it. If any other theme
// starts then or later it is "already built" and left alone, never rebuilt. Otherwise it is the
// family's highest plan week plus one (1 when there is none), however many Sundays were skipped.
export function nextWeek(input: { themes: ThemeRow[]; own: Set<string>; today: string }): NextWeek {
  const monday = nextMonday(input.today);
  const mine = input.themes.find((t) => input.own.has(t.id) && t.week_start === monday);
  if (mine) return { kind: "build", week: mine.plan_week ?? 1, start: monday, theme: mine.id };
  const later = input.themes.filter((t) => t.week_start >= monday).sort((a, b) => a.week_start.localeCompare(b.week_start))[0];
  if (later) return { kind: "refuse", reason: `week ${later.plan_week ?? "?"} is already built`, week: later.plan_week };
  const last = Math.max(0, ...input.themes.map((t) => t.plan_week ?? 0));
  return { kind: "build", week: last + 1, start: monday, theme: null };
}

// --- Which day ---

// What one day of a theme holds: ideas, and per child the cards and questions.
export type DayCount = { ideas: number; cards: Record<string, number>; questions: Record<string, number> };
export type DayState = "empty" | "complete" | "partial";

// Complete only on exact counts, so a day written twice (the database has no unique constraint to stop it)
// is partial too, and is cleared and built again.
export function dayState(count: DayCount | undefined, childIds: string[]): DayState {
  if (!count) return "empty";
  const held = count.ideas + Object.values(count.cards).reduce((a, b) => a + b, 0) + Object.values(count.questions).reduce((a, b) => a + b, 0);
  if (held === 0) return "empty";
  const whole = count.ideas === IDEAS_A_DAY && childIds.every((c) => count.cards[c] === CARDS_A_DAY && count.questions[c] === CARDS_A_DAY);
  return whole ? "complete" : "partial";
}

// The earliest day that is not complete, and whether it has to be cleared first. Null: all seven are in.
export function nextDay(counts: Map<number, DayCount>, childIds: string[]): { day: number; rebuild: boolean } | null {
  for (let day = 1; day <= DAYS_IN_WEEK; day++) {
    const state = dayState(counts.get(day), childIds);
    if (state !== "complete") return { day, rebuild: state === "partial" };
  }
  return null;
}

// --- The rows a firing leaves, and the lock ---

export type Outcome = "started" | "theme" | "built" | "nothing" | "refused" | "failed";
export type CronTarget = {
  outcome: Outcome;
  week: number | null;
  day: number | null;
  theme: string | null;
  started?: string; // on every row after the first: the started row it belongs to
  schedule?: string | null; // Vercel's x-vercel-cron-schedule, on the started row
  reason?: string;
  error?: string;
  [more: string]: unknown;
};
export type CronRow = { id: string; created_at: string; target: CronTarget };

const isEnd = (o: Outcome) => o === "built" || o === "nothing" || o === "refused" || o === "failed";
const before = (a: CronRow, b: CronRow) => {
  const t = Date.parse(a.created_at) - Date.parse(b.created_at);
  return t !== 0 ? t < 0 : a.id < b.id;
};

// The earlier firing that has this week and day and has not ended, if there is one. Only the earliest of
// the firings at once goes on. A firing that has ended (built, refused or failed) holds nothing, so a hand
// retry right after one that failed is not kept waiting. `rows` are the week.cron rows of the last
// LOCK_MINUTES, mine included.
export function blockedBy(rows: CronRow[], mine: string, week: number | null, day: number | null): CronRow | null {
  const me = rows.find((r) => r.id === mine);
  if (!me) return null;
  const ended = new Set(rows.filter((r) => isEnd(r.target.outcome) && r.target.started).map((r) => r.target.started));
  return (
    rows
      .filter((r) => r.target.outcome === "started" && r.id !== mine && !ended.has(r.id) && r.target.week === week && r.target.day === day && before(r, me))
      .sort((a, b) => (before(a, b) ? -1 : 1))[0] ?? null
  );
}

// No nickname goes into a row or a reply (rule 7). A failure's text can quote a few characters of model
// output, which can hold one, so every nickname of the family is taken out of it.
export function scrubNames(text: string, names: string[]): string {
  let out = text;
  for (const name of names.filter((n) => n.trim())) {
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"), "[child]");
  }
  return out;
}

// --- A firing ---

export type BuiltDay = {
  theme: string;
  passed: number;
  heldBack: number;
  pending: number | null; // null: the gate stopped before it could say
  cost: number;
  gateError: string | null;
};

export type CronDeps<B> = {
  now: () => Date;
  families: () => Promise<{ id: string; timezone: string }[]>;
  children: (familyId: string) => Promise<{ id: string; nickname: string }[]>;
  themes: (familyId: string) => Promise<ThemeRow[]>;
  ownThemes: (familyId: string) => Promise<Set<string>>; // themes a firing made (their theme rows)
  counts: (themeId: string, weekStart: string) => Promise<Map<number, DayCount>>;
  recentRows: (familyId: string, since: Date) => Promise<CronRow[]>;
  audit: (familyId: string, target: CronTarget) => Promise<string>; // the new row's id
  envProblem: () => string | null; // a model name or the API key missing
  prepare: (week: number, start: string) => Promise<B>; // throws "Not enough short lessons…" when the library is short
  gateProblem: (prepared: B) => string | null; // no rulebook, or one older than the guardians' answers
  build: (prepared: B, run: { day: number; rebuild: boolean; onTheme: (themeId: string) => Promise<void> }) => Promise<BuiltDay>;
  gatePending: (themeId: string) => Promise<{ problem: string } | { passed: number; heldBack: number; pending: number; cost: number }>;
};

export type CronReply = {
  outcome: "built" | "nothing" | "refused" | "failed";
  week: number | null;
  day: number | null;
  theme: string | null;
  reason?: string;
  cost?: number;
  seconds: number;
};

const oneLine = (s: string) => s.split("\n")[0].slice(0, 400);

// One firing: read the state (writing nothing), record the start, take the lock, refuse before spending
// where the state says so, then build the one day and record how it ended. Anything thrown once the start
// is recorded ends as a `failed` row. A read that fails before it throws to the caller.
export async function cronFiring<B>(deps: CronDeps<B>, ctx: { schedule: string | null }): Promise<CronReply> {
  const began = deps.now();
  const seconds = () => Math.round((deps.now().getTime() - began.getTime()) / 100) / 10;

  const families = await deps.families();
  if (families.length !== 1) {
    // audit_log needs a family to write to, so this refusal is the reply and nothing else.
    return { outcome: "refused", week: null, day: null, theme: null, reason: `expected one family, found ${families.length}`, seconds: seconds() };
  }
  const family = families[0];
  const kids = await deps.children(family.id);
  const childIds = kids.map((k) => k.id);
  const clean = (s: string) => scrubNames(s, kids.map((k) => k.nickname));

  const themes = await deps.themes(family.id);
  const next = nextWeek({ themes, own: await deps.ownThemes(family.id), today: todayIn(family.timezone, began) });

  let week: number | null = next.week;
  let day: number | null = null;
  let theme: string | null = next.kind === "build" ? next.theme : null;
  let rebuild = false;
  let allBuilt = false;
  let early: { outcome: "refused" | "nothing"; reason: string } | null = null;
  const weekStartOf = (id: string) => themes.find((t) => t.id === id)!.week_start;

  if (next.kind === "refuse") early = { outcome: "refused", reason: next.reason };
  else if (theme) {
    const status = themes.find((t) => t.id === theme)!.status;
    if (status === "live" || status === "done") early = { outcome: "nothing", reason: `week ${week} is already ${status}` };
    else {
      const upcoming = nextDay(await deps.counts(theme, weekStartOf(theme)), childIds);
      if (upcoming) ({ day, rebuild } = upcoming);
      else allBuilt = true;
    }
  } else {
    day = 1;
  }

  const started = await deps.audit(family.id, { outcome: "started", week, day, theme, schedule: ctx.schedule });
  const end = async (outcome: "built" | "nothing" | "refused" | "failed", extra: Record<string, unknown> = {}): Promise<CronReply> => {
    await deps.audit(family.id, { outcome, started, week, day, theme, ...extra });
    const { reason, cost } = extra as { reason?: string; cost?: number };
    return { outcome, week, day, theme, ...(reason ? { reason } : {}), ...(cost !== undefined ? { cost } : {}), seconds: seconds() };
  };

  try {
    if (early) return await end(early.outcome, { reason: clean(early.reason) });

    // 1. The lock: only the earliest firing that has not ended goes on.
    if (blockedBy(await deps.recentRows(family.id, new Date(began.getTime() - LOCK_MINUTES * 60_000)), started, week, day)) {
      return await end("refused", { reason: `another firing is working on ${day === null ? `week ${week}` : `day ${day} of week ${week}`}` });
    }
    // The day may have been built between the read and the lock; read it again before clearing anything.
    if (theme && day !== null) {
      const again = nextDay(await deps.counts(theme, weekStartOf(theme)), childIds);
      if (!again || again.day !== day) return await end("nothing", { reason: `day ${day} of week ${week} was built by another firing` });
      rebuild = again.rebuild;
    }

    // 5, 3 and 4, in the order they can be told apart: the model names and the key, then the library, then the gate.
    const env = deps.envProblem();
    if (env) return await end("refused", { reason: clean(env) });

    if (allBuilt) {
      // Every day is in. What can still be done is the cards an earlier firing left pending.
      const checked = await deps.gatePending(theme!);
      if ("problem" in checked) return await end("refused", { reason: clean(oneLine(checked.problem)) });
      return await end("nothing", { reason: `all seven days of week ${week} are built`, passed: checked.passed, held_back: checked.heldBack, pending: checked.pending, cost: checked.cost });
    }

    let prepared: B;
    try {
      prepared = await deps.prepare(week!, (next as { start: string }).start);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (/^Not enough short lessons/.test(message)) return await end("refused", { reason: clean(oneLine(message)) });
      throw e;
    }
    const noGate = deps.gateProblem(prepared);
    if (noGate) return await end("refused", { reason: clean(oneLine(noGate)) });

    const built = await deps.build(prepared, {
      day: day!,
      rebuild,
      onTheme: async (id) => {
        theme = id;
        await deps.audit(family.id, { outcome: "theme", started, week, day, theme: id });
      },
    });
    return await end("built", {
      theme: built.theme,
      passed: built.passed,
      held_back: built.heldBack,
      pending: built.pending,
      cost: built.cost,
      ...(built.gateError ? { gate_error: clean(faultText(built.gateError)) } : {}),
    });
  } catch (e) {
    return await end("failed", { error: clean(faultText(e)) });
  }
}
