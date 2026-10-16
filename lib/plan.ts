import { parse } from "yaml";
import { PERSPECTIVE, type Perspective } from "./values.ts";

// The long-term plan, as YAML under plan/ (docs/04): stretches, one file each, and the library of
// short lessons, plan/short-lessons.yaml. A stretch is a running thread: its topics run one a day,
// in the file's order, on the slot each names, and its weeks are the thread's chapters. A short
// lesson is one idea chain on one slot, not tied to a stretch or a week (decided 16 Oct 2026,
// docs/08). npm run plan:import turns both into plan_topics rows with planRows() and libraryRows().

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

// A short lesson. Unlike a stretch topic it has its own key, and its own values points and
// perspective, which a stretch topic takes from its week. values_points is required, [] for none,
// so every lesson answers "does this touch a values point?" for the gate (step 5).
export type ShortLesson = PlanTopic & {
  key: string;
  values_points: number[];
  perspective?: Perspective;
};

export type Library = {
  library: string; // "short-lessons", the file name
  title: string;
  sources: PlanSource[];
  lessons: ShortLesson[]; // in the order they run
};

export function parsePlan(text: string): Plan {
  return parse(text) as Plan;
}

export function parseLibrary(text: string): Library {
  return parse(text) as Library;
}

// The library names itself with library:, a stretch with stretch:.
export const isLibrary = (doc: unknown): doc is Library => !!doc && typeof doc === "object" && "library" in doc;

const text = (v: unknown) => typeof v === "string" && v.trim() !== "";
const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// The sources list, the same for stretches and the library. Returns the ids it found.
function checkSources(sources: PlanSource[] | undefined, errors: string[]): Set<string> {
  const ids = new Set<string>();
  for (const s of sources ?? []) {
    const where = `source ${s?.id ?? "?"}`;
    for (const key of ["id", "title", "publisher", "url", "license"] as const) {
      if (!text(s?.[key])) errors.push(`${where}: missing ${key}`);
    }
    if (text(s?.url) && !/^https:\/\//.test(s.url)) errors.push(`${where}: url must be https`);
    if (ids.has(s?.id)) errors.push(`${where}: listed twice`);
    ids.add(s?.id);
  }
  return ids;
}

// One topic or lesson: a known subject, a slot, a title, both summaries, and listed sources.
function checkTopic(t: PlanTopic, at: string, sourceIds: Set<string>, errors: string[]) {
  if (!SUBJECTS.includes(t?.subject)) errors.push(`${at}: unknown subject "${t?.subject}"`);
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

// Values points 1-24, and a perspective whenever there are any.
function checkPoints(points: number[] | undefined, perspective: Perspective | undefined, where: string, errors: string[]) {
  if (perspective !== undefined && !PERSPECTIVE.includes(perspective)) {
    errors.push(`${where}: perspective must be one of ${PERSPECTIVE.join(", ")}`);
  }
  for (const p of points ?? []) {
    if (!Number.isInteger(p) || p < 1 || p > 24) errors.push(`${where}: values point ${p} is not 1-24`);
  }
  if (points?.length && !perspective) errors.push(`${where}: values_points need a perspective`);
}

// Everything wrong with a stretch, in plain words. Empty when it's valid.
// Every week needs science, art, music, literature, math, and history or geography; every topic
// needs a slot and a summary for both grade bands.
export function validatePlan(plan: Plan): string[] {
  const errors: string[] = [];
  if (!plan || typeof plan !== "object") return ["not a YAML mapping"];
  if (!text(plan.stretch) || !KEY.test(plan.stretch)) errors.push("stretch must be lowercase words joined by hyphens");
  if (!text(plan.title)) errors.push("missing title");
  if (!Number.isInteger(plan.sequence) || plan.sequence < 1) errors.push("sequence must be a whole number from 1");

  const sourceIds = checkSources(plan.sources, errors);

  const weeks = plan.weeks ?? [];
  if (weeks.length === 0) errors.push("no weeks");
  weeks.forEach((w, i) => {
    const where = `week ${w?.week ?? "?"}`;
    if (w?.week !== i + 1) errors.push(`weeks must be numbered 1, 2, 3... in order; found ${w?.week} at position ${i + 1}`);
    if (!text(w?.title)) errors.push(`${where}: missing title`);
    if (!text(w?.why)) errors.push(`${where}: missing why`);
    checkPoints(w?.values_points, w?.perspective, where, errors);

    const topics = w?.topics ?? [];
    const subjects = topics.map((t) => t?.subject);
    for (const s of ["science", "art", "music", "literature", "math"] as const) {
      if (!subjects.includes(s)) errors.push(`${where}: missing ${s}`);
    }
    if (!subjects.includes("history") && !subjects.includes("geography")) errors.push(`${where}: missing history or geography`);
    for (const s of new Set(subjects)) {
      if (subjects.filter((x) => x === s).length > 1) errors.push(`${where}: ${s} appears twice`);
    }

    for (const t of topics) checkTopic(t, `${where} ${t?.subject ?? "?"}`, sourceIds, errors);
    const slots = new Set(topics.map((t) => t?.slot));
    for (const slot of SLOTS) {
      if (!slots.has(slot)) errors.push(`${where}: no topic feeds the ${slot} card`);
    }
  });
  return errors;
}

// Everything wrong with the library of short lessons. Empty when it's valid.
export function validateLibrary(lib: Library): string[] {
  const errors: string[] = [];
  if (!lib || typeof lib !== "object") return ["not a YAML mapping"];
  if (!text(lib.library) || !KEY.test(lib.library)) errors.push("library must be lowercase words joined by hyphens");
  if (!text(lib.title)) errors.push("missing title");

  const sourceIds = checkSources(lib.sources, errors);
  const lessons = lib.lessons ?? [];
  if (lessons.length === 0) errors.push("no lessons");
  const keys = new Set<string>();
  for (const l of lessons) {
    const where = `lesson ${l?.key ?? "?"}`;
    if (!text(l?.key) || !KEY.test(l.key)) errors.push(`${where}: key must be lowercase words joined by hyphens`);
    if (keys.has(l?.key)) errors.push(`${where}: key used twice`);
    keys.add(l?.key);
    checkTopic(l, where, sourceIds, errors);
    if (!Array.isArray(l?.values_points)) errors.push(`${where}: say which values points it touches, or values_points: [] for none`);
    checkPoints(l?.values_points, l?.perspective, where, errors);
  }
  const slots = new Set(lessons.map((l) => l?.slot));
  for (const slot of SLOTS) {
    if (!slots.has(slot)) errors.push(`no lesson feeds the ${slot} card`);
  }
  return errors;
}

// What a stretch can still be imported with, but should fix: every topic without a source, whose
// cards come out text only (docs/04, "How a topic gets its picture"). A warning, not an error, so a
// plan can be imported while its pictures are still being found.
export function planWarnings(plan: Plan): string[] {
  const warnings: string[] = [];
  for (const w of plan?.weeks ?? []) {
    for (const t of w?.topics ?? []) {
      if (!t?.sources?.length) warnings.push(`week ${w.week} ${t?.subject ?? "?"} (${t?.slot ?? "?"}): no sources, so its cards are text only`);
    }
  }
  return warnings;
}

export function libraryWarnings(lib: Library): string[] {
  return (lib?.lessons ?? [])
    .filter((l) => !l?.sources?.length)
    .map((l) => `lesson ${l?.key ?? "?"} (${l?.slot ?? "?"}): no sources, so its cards are text only`);
}

// week: a stretch's chapter row; thread: a stretch topic; short: a short lesson.
export type PlanKind = "week" | "thread" | "short";

export type PlanRow = {
  key: string;
  parent_key: string | null;
  kind: PlanKind;
  position: number | null; // a thread topic's place in its stretch, or a lesson's in the library
  sequence: number;
  week: number | null;
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
export const lessonKey = (key: string, band: GradeBand) => `short/${key}/${band}`;
// The same topic's row in the other grade band: every key ends in its band.
export const otherBand = (key: string) => key.replace(/\/(2-3|4-5)$/, (_, b) => (b === "2-3" ? "/4-5" : "/2-3"));

// One row per week per grade band (subject 'week', summary = why), then one row per topic per
// grade band whose parent is that band's week. Week rows come first so their ids exist. A topic's
// position counts through the whole stretch, so day 1 of the thread is position 1.
export function planRows(plan: Plan): PlanRow[] {
  const sources = new Map(plan.sources.map((s) => [s.id, s]));
  const weeks: PlanRow[] = [];
  const topics: PlanRow[] = [];
  let position = 0;
  for (const w of plan.weeks) {
    const first = position;
    for (const band of GRADE_BANDS) {
      position = first;
      const parent = weekKey(plan.stretch, w.week, band);
      weeks.push({
        key: parent,
        parent_key: null,
        kind: "week",
        position: null,
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
          kind: "thread",
          position: ++position,
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

// One row per lesson per grade band, keyed short/<key>/<band>, with no week and no parent.
// sequence is 0: the library sits outside the order of stretches.
export function libraryRows(lib: Library): PlanRow[] {
  const sources = new Map(lib.sources.map((s) => [s.id, s]));
  return lib.lessons.flatMap((l, i) =>
    GRADE_BANDS.map((band) => ({
      key: lessonKey(l.key, band),
      parent_key: null,
      kind: "short" as const,
      position: i + 1,
      sequence: 0,
      week: null,
      grade_band: band,
      subject: l.subject,
      slot: l.slot,
      title: l.title.trim(),
      summary: l.summary[band].trim(),
      sources: (l.sources ?? []).map((id) => sources.get(id)!),
      perspective: l.perspective ?? null,
      values_points: l.values_points ?? [],
      parent_note: l.parent_note?.trim() || null,
    })),
  );
}
