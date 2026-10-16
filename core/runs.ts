import type { ModelUse, Usage } from "./model.ts"; // types only: model.ts is server-only
import { costOf } from "./prices.ts";

// What a run spent on models, as the scripts record it in model_runs and the models page reads it
// back (docs/04, "How the models and costs page is built"). Counts and money only (rule 7).

export type RunKind = "week:build" | "content:fetch";

// One job on one model in a run. cost is null when the model isn't in core/prices.ts.
export type RunModel = { use: ModelUse; model: string; calls: number; input: number; output: number; cost: number | null };

export type RunRow = {
  kind: RunKind;
  ok: boolean;
  started_at: string;
  theme_id: string | null;
  week: number | null;
  days: number | null;
  children: number | null;
  models: RunModel[];
  cost: number;
  cost_complete: boolean;
};

// The row a script writes at the end of a run, from core/model.ts's usageSoFar().
export function runRow(
  kind: RunKind,
  usage: Usage[],
  run: { ok: boolean; startedAt: Date; themeId?: string | null; week?: number; days?: number; children?: number },
): RunRow {
  const models = usage.map(({ use, model, calls, input, output }) => ({ use, model, calls, input, output, cost: costOf(model, { input, output }) }));
  return {
    kind,
    ok: run.ok,
    started_at: run.startedAt.toISOString(),
    theme_id: run.themeId ?? null,
    week: run.week ?? null,
    days: run.days ?? null,
    children: run.children ?? null,
    models,
    cost: Math.round(models.reduce((sum, m) => sum + (m.cost ?? 0), 0) * 10_000) / 10_000,
    cost_complete: models.every((m) => m.cost !== null),
  };
}

// A run as the page reads it back.
export type RecordedRun = Pick<RunRow, "kind" | "ok" | "days" | "children" | "models"> & { finished_at: string };

export const OLD_WEEK_ESTIMATE = 5.7; // docs/04, decided 14 Oct 2026
export const WEEKS_PER_MONTH = 52 / 12;

export type Estimate = {
  ideasPerDay: number; // the shared idea chains for one day, both children
  cardsPerChildDay: number; // one child's cards for one day
  week: number; // seven days for `children` children
  month: number;
  children: number;
  ideaRuns: number; // how many runs each rate is taken from
  cardRuns: number;
  ideaDays: number;
  cardChildDays: number;
  pricesMissing: boolean; // some run used a model without a known price, so the rate is low
};

// A full week and a month, from the cost per day of the most recent successful week:build runs.
// Ideas are shared, so they are priced per day; cards per child per day. A run that built cards
// for one child (--child) counts toward cards only, and a run that stopped part way counts toward
// neither. Null until some run has built both ideas and cards. The gate (step 5) isn't in it yet.
export function estimate(runs: RecordedRun[], children: number, recent = 5): Estimate | null {
  const built = runs
    .filter((r) => r.kind === "week:build" && r.ok && r.days && r.children)
    .sort((a, b) => b.finished_at.localeCompare(a.finished_at));
  const spent = (r: RecordedRun, use: ModelUse) => r.models.filter((m) => m.use === use);
  const withIdeas = built.filter((r) => spent(r, "curate").length).slice(0, recent);
  const withCards = built.filter((r) => spent(r, "write").length).slice(0, recent);
  if (!withIdeas.length || !withCards.length) return null;

  const sum = (list: RecordedRun[], use: ModelUse) => list.reduce((s, r) => s + spent(r, use).reduce((t, m) => t + (m.cost ?? 0), 0), 0);
  const ideaDays = withIdeas.reduce((s, r) => s + r.days!, 0);
  const cardChildDays = withCards.reduce((s, r) => s + r.days! * r.children!, 0);
  const ideasPerDay = sum(withIdeas, "curate") / ideaDays;
  const cardsPerChildDay = sum(withCards, "write") / cardChildDays;
  const week = 7 * (ideasPerDay + children * cardsPerChildDay);
  const used = [...withIdeas.flatMap((r) => spent(r, "curate")), ...withCards.flatMap((r) => spent(r, "write"))];
  return {
    ideasPerDay,
    cardsPerChildDay,
    week,
    month: week * WEEKS_PER_MONTH,
    children,
    ideaRuns: withIdeas.length,
    cardRuns: withCards.length,
    ideaDays,
    cardChildDays,
    pricesMissing: used.some((m) => m.cost === null),
  };
}
