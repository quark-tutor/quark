import { parse } from "yaml";
import { PERSPECTIVE, type Perspective } from "./values.ts";

// The long-term plan, one YAML file per stretch under plan/ (docs/04). Each week ties several
// subjects together; each topic has a summary per grade band and names the wall slot it feeds.
// npm run plan:import turns a stretch into plan_topics rows with planRows().

export const SUBJECTS = ["history", "geography", "science", "art", "music", "literature", "math"] as const;
export const SLOTS = ["look", "wonder", "listen", "then", "puzzle"] as const;
export const GRADE_BANDS = ["2-3", "4-5"] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Slot = (typeof SLOTS)[number];
export type GradeBand = (typeof GRADE_BANDS)[number];

export type PlanSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  license: string;
  check?: string; // why a person should look before it's used
};

export type PlanTopic = {
  subject: Subject;
  slot: Slot;
  title: string;
  sources?: string[];
  summary: Record<GradeBand, string>;
  parent_note?: string;
};

export type PlanWeek = {
  week: number;
  title: string;
  why: string;
  perspective?: Perspective;
  values_points?: number[];
  topics: PlanTopic[];
};

export type Plan = {
  stretch: string; // the file name and the key prefix: "ancient-egypt"
  title: string;
  sequence: number; // the stretch's place in the whole plan
  sources: PlanSource[];
  weeks: PlanWeek[];
};

export function parsePlan(text: string): Plan {
  return parse(text) as Plan;
}

const text = (v: unknown) => typeof v === "string" && v.trim() !== "";

// Everything wrong with a stretch, in plain words. Empty when it's valid.
// Every week needs science, art, music, literature, math, and history or geography; every topic
// needs a slot and a summary for both grade bands.
export function validatePlan(plan: Plan): string[] {
  const errors: string[] = [];
  if (!plan || typeof plan !== "object") return ["not a YAML mapping"];
  if (!text(plan.stretch) || !/^[a-z0-9-]+$/.test(plan.stretch)) errors.push("stretch must be lowercase words joined by hyphens");
  if (!text(plan.title)) errors.push("missing title");
  if (!Number.isInteger(plan.sequence) || plan.sequence < 1) errors.push("sequence must be a whole number from 1");

  const sourceIds = new Set<string>();
  for (const s of plan.sources ?? []) {
    const where = `source ${s?.id ?? "?"}`;
    for (const key of ["id", "title", "publisher", "url", "license"] as const) {
      if (!text(s?.[key])) errors.push(`${where}: missing ${key}`);
    }
    if (text(s?.url) && !/^https:\/\//.test(s.url)) errors.push(`${where}: url must be https`);
    if (sourceIds.has(s?.id)) errors.push(`${where}: listed twice`);
    sourceIds.add(s?.id);
  }

  const weeks = plan.weeks ?? [];
  if (weeks.length === 0) errors.push("no weeks");
  weeks.forEach((w, i) => {
    const where = `week ${w?.week ?? "?"}`;
    if (w?.week !== i + 1) errors.push(`weeks must be numbered 1, 2, 3... in order; found ${w?.week} at position ${i + 1}`);
    if (!text(w?.title)) errors.push(`${where}: missing title`);
    if (!text(w?.why)) errors.push(`${where}: missing why`);
    if (w?.perspective !== undefined && !PERSPECTIVE.includes(w.perspective)) {
      errors.push(`${where}: perspective must be one of ${PERSPECTIVE.join(", ")}`);
    }
    for (const p of w?.values_points ?? []) {
      if (!Number.isInteger(p) || p < 1 || p > 24) errors.push(`${where}: values point ${p} is not 1-24`);
    }
    if (w?.values_points?.length && !w.perspective) errors.push(`${where}: values_points need a perspective`);

    const topics = w?.topics ?? [];
    const subjects = topics.map((t) => t?.subject);
    for (const s of subjects) {
      if (!SUBJECTS.includes(s)) errors.push(`${where}: unknown subject "${s}"`);
    }
    for (const s of ["science", "art", "music", "literature", "math"] as const) {
      if (!subjects.includes(s)) errors.push(`${where}: missing ${s}`);
    }
    if (!subjects.includes("history") && !subjects.includes("geography")) errors.push(`${where}: missing history or geography`);
    for (const s of new Set(subjects)) {
      if (subjects.filter((x) => x === s).length > 1) errors.push(`${where}: ${s} appears twice`);
    }

    for (const t of topics) {
      const at = `${where} ${t?.subject ?? "?"}`;
      if (!SLOTS.includes(t?.slot)) errors.push(`${at}: slot must be one of ${SLOTS.join(", ")}`);
      if (!text(t?.title)) errors.push(`${at}: missing title`);
      for (const band of GRADE_BANDS) {
        if (!text(t?.summary?.[band])) errors.push(`${at}: missing summary for ${band}`);
      }
      for (const band of Object.keys(t?.summary ?? {})) {
        if (!GRADE_BANDS.includes(band as GradeBand)) errors.push(`${at}: unknown grade band "${band}"`);
      }
      for (const id of t?.sources ?? []) {
        if (!sourceIds.has(id)) errors.push(`${at}: source "${id}" is not listed`);
      }
    }
    const slots = new Set(topics.map((t) => t?.slot));
    for (const slot of SLOTS) {
      if (!slots.has(slot)) errors.push(`${where}: no topic feeds the ${slot} card`);
    }
  });
  return errors;
}

export type PlanRow = {
  key: string;
  parent_key: string | null;
  sequence: number;
  week: number;
  grade_band: GradeBand;
  subject: string;
  slot: Slot | null;
  title: string;
  summary: string;
  sources: PlanSource[];
  perspective: Perspective | null;
  values_points: number[];
  parent_note: string | null;
};

export const weekKey = (stretch: string, week: number, band: GradeBand) => `${stretch}/w${week}/${band}`;
export const topicKey = (stretch: string, week: number, subject: string, band: GradeBand) =>
  `${stretch}/w${week}/${subject}/${band}`;

// One row per week per grade band (subject 'week', summary = why), then one row per topic per
// grade band whose parent is that band's week. Week rows come first so their ids exist.
export function planRows(plan: Plan): PlanRow[] {
  const sources = new Map(plan.sources.map((s) => [s.id, s]));
  const weeks: PlanRow[] = [];
  const topics: PlanRow[] = [];
  for (const w of plan.weeks) {
    for (const band of GRADE_BANDS) {
      const parent = weekKey(plan.stretch, w.week, band);
      weeks.push({
        key: parent,
        parent_key: null,
        sequence: plan.sequence,
        week: w.week,
        grade_band: band,
        subject: "week",
        slot: null,
        title: w.title.trim(),
        summary: w.why.trim(),
        sources: [],
        perspective: w.perspective ?? null,
        values_points: w.values_points ?? [],
        parent_note: null,
      });
      for (const t of w.topics) {
        topics.push({
          key: topicKey(plan.stretch, w.week, t.subject, band),
          parent_key: parent,
          sequence: plan.sequence,
          week: w.week,
          grade_band: band,
          subject: t.subject,
          slot: t.slot,
          title: t.title.trim(),
          summary: t.summary[band].trim(),
          sources: (t.sources ?? []).map((id) => sources.get(id)!),
          perspective: w.perspective ?? null,
          values_points: w.values_points ?? [],
          parent_note: t.parent_note?.trim() || null,
        });
      }
    }
  }
  return [...weeks, ...topics];
}
