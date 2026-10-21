// The Sunday build against the database: the real CronDeps for core/curation/cron.ts, used by
// app/api/cron/week/route.ts. The route passes the service-role client (every query here is scoped to the
// one family by what it reads) and a model call and tally of its own, so a warm Vercel instance's earlier
// firings are never counted in this one. Relative imports with extensions, as week-job.ts has.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { complete } from "../model.ts";
import { runRow, type Meter } from "../runs.ts";
import { CRON_ACTION, type BuiltDay, type CronDeps, type CronRow, type CronTarget, type DayCount, type ThemeRow } from "./cron.ts";
import { gateSetup, gateTheme, type GateSetup } from "./gate-run.ts";
import { buildDays, prepareWeek, type Prepared } from "./week-job.ts";

// What the model names and the key are checked against; the values are never read out.
const NEEDED = ["QUARK_MODEL_CURATE", "QUARK_MODEL_WRITE", "QUARK_MODEL_GATE", "ANTHROPIC_API_KEY"] as const;

// What a firing prepares before it spends: the week, and the gate's rulebook and floor.
export type CronBundle = { prepared: Prepared; gate: GateSetup };

type Reply = { data: unknown; error: { message: string } | null };
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  if (r.data === null || r.data === undefined) throw new Error(`${what}: nothing came back`);
  return r.data as NonNullable<R["data"]>;
}

const dayNumber = (date: string, weekStart: string) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${weekStart}T00:00:00Z`)) / 86_400_000) + 1;

export function makeCronDeps(
  db: SupabaseClient,
  ai: { complete: typeof complete; meter: Meter },
  env: Record<string, string | undefined> = process.env,
): CronDeps<CronBundle> {
  const spent = () => runRow("week:build", ai.meter.usage(), { ok: true, startedAt: new Date() }).cost;

  return {
    now: () => new Date(),

    async families() {
      return must(await db.from("families").select("id, timezone"), "families") as { id: string; timezone: string }[];
    },

    async children(familyId) {
      return must(await db.from("children").select("id, nickname").eq("family_id", familyId), "children") as { id: string; nickname: string }[];
    },

    async themes(familyId) {
      return must(await db.from("themes").select("id, week_start, plan_week, status").eq("family_id", familyId), "themes") as ThemeRow[];
    },

    // The themes a firing made: each has a theme row written the moment it was created.
    async ownThemes(familyId) {
      const rows = must(
        await db.from("audit_log").select("target").eq("family_id", familyId).eq("action", CRON_ACTION).eq("target->>outcome", "theme"),
        "audit_log",
      ) as { target: CronTarget }[];
      return new Set(rows.map((r) => r.target.theme).filter((id): id is string => !!id));
    },

    // Ideas, cards and questions per day, so a day is "built" only when all of it is there.
    async counts(themeId, weekStart) {
      const [ideas, cards, questions] = await Promise.all([
        db.from("ideas").select("day").eq("theme_id", themeId),
        db.from("cards").select("child_id, day").eq("theme_id", themeId),
        db.from("questions").select("cards!inner(child_id, day, theme_id)").eq("cards.theme_id", themeId),
      ]);
      const map = new Map<number, DayCount>();
      const at = (day: number) => {
        if (!map.has(day)) map.set(day, { ideas: 0, cards: {}, questions: {} });
        return map.get(day)!;
      };
      for (const i of must(ideas, "ideas") as { day: number }[]) at(i.day).ideas += 1;
      for (const c of must(cards, "cards") as { child_id: string; day: string }[]) {
        const d = at(dayNumber(c.day, weekStart));
        d.cards[c.child_id] = (d.cards[c.child_id] ?? 0) + 1;
      }
      for (const q of must(questions, "questions") as unknown as { cards: { child_id: string; day: string } }[]) {
        const d = at(dayNumber(q.cards.day, weekStart));
        d.questions[q.cards.child_id] = (d.questions[q.cards.child_id] ?? 0) + 1;
      }
      return map;
    },

    async recentRows(familyId, since) {
      const rows = must(
        await db
          .from("audit_log")
          .select("id, created_at, target")
          .eq("family_id", familyId)
          .eq("action", CRON_ACTION)
          .gte("created_at", since.toISOString())
          .order("created_at"),
        "audit_log",
      );
      return rows as CronRow[];
    },

    // No guardian did it, so guardian_id stays empty. Nothing in a row names a child.
    async audit(familyId, target) {
      const row = must(await db.from("audit_log").insert({ family_id: familyId, guardian_id: null, action: CRON_ACTION, target }).select("id").single(), "audit_log");
      return row.id as string;
    },

    envProblem() {
      const missing = NEEDED.filter((name) => !env[name]);
      return missing.length ? `${missing.join(", ")} ${missing.length === 1 ? "isn't" : "aren't"} set where the build runs` : null;
    },

    // The library check (weekSchedule) throws inside prepareWeek, before anything is spent.
    async prepare(week, start) {
      const prepared = await prepareWeek(db, { week, start });
      return { prepared, gate: await gateSetup(db, prepared.family.id) };
    },

    gateProblem: (b) => b.gate.missing,

    async build(b, run): Promise<BuiltDay> {
      const result = await buildDays(b.prepared, { day: run.day }, { complete: ai.complete, meter: ai.meter, gate: b.gate, rebuild: run.rebuild, pendingOnly: true, onTheme: run.onTheme });
      const g = result.gate;
      return {
        theme: result.report.themeId,
        passed: g?.passed ?? 0,
        heldBack: g ? g.blockedByCode + g.blockedByModel : 0,
        pending: g ? g.pending : null,
        cost: spent(),
        gateError: result.gateError,
      };
    },

    // Every day is built: finish only what an earlier firing left pending, and record it if it spent.
    async gatePending(themeId) {
      const started = new Date();
      const theme = must(await db.from("themes").select("family_id, plan_week").eq("id", themeId).single(), "themes") as { family_id: string; plan_week: number | null };
      const gate = await gateSetup(db, theme.family_id);
      if (gate.missing) return { problem: gate.missing };
      const report = await gateTheme(db, theme.family_id, themeId, gate, { complete: ai.complete, pendingOnly: true });
      if (ai.meter.usage().length) {
        const row = runRow("gate", ai.meter.usage(), { ok: report.pending === 0, startedAt: started, themeId, week: theme.plan_week ?? undefined, children: gate.children.length });
        await db.from("model_runs").insert({ family_id: theme.family_id, ...row });
      }
      return { passed: report.passed, heldBack: report.blockedByCode + report.blockedByModel, pending: report.pending, cost: spent() };
    },
  };
}
