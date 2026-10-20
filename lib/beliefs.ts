import { LEANS, PERSPECTIVE, WHEN, type Lean, type Perspective, type When } from "./values.ts";

// "Our Family's Beliefs": the five ways a family can handle a subject (gate/values-interview.md).
// Shared by the /parent/beliefs page and its server actions, so it holds no secrets.

export const ANSWERS = [
  { id: "ours", label: "Answer from what we believe" },
  { id: "fair", label: "Answer, and show other views" },
  { id: "later", label: "Not yet" },
  { id: "us", label: "Send them to us" },
  { id: "never", label: "Don't bring it up" },
] as const;
export type AnswerId = (typeof ANSWERS)[number]["id"];
export const ANSWER_IDS: readonly AnswerId[] = ANSWERS.map((a) => a.id);

export type LeanChoice = Lean | "unset";
export const LEAN_CHOICES: readonly LeanChoice[] = [...LEANS, "unset"];

export type Setting = { when: When; perspective: Perspective };

// The pack entry fields an answer can take from.
export type EntrySetting = { when: When; perspective: Perspective; from_age: number | null };

export function answerOf(s: Setting): AnswerId {
  if (s.when === "never") return "never";
  if (s.when === "parent_led") return "us";
  if (s.when === "from_age") return "later";
  return s.perspective === "family_tradition" ? "ours" : "fair";
}

// The setting an answer stands for. "Not yet" also says how to answer once the child is ready:
// from the pack the answer came from, else what the guardian had chosen, else several views.
export function settingFor(answer: AnswerId, from?: Setting | null, current?: Setting | null): Setting {
  switch (answer) {
    case "ours":
      return { when: "anytime", perspective: "family_tradition" };
    case "fair":
      return { when: "anytime", perspective: "several_fairly" };
    case "us":
      return { when: "parent_led", perspective: "omitted" };
    case "never":
      return { when: "never", perspective: "omitted" };
    case "later": {
      const ready = [from?.perspective, current?.when === "from_age" ? current.perspective : undefined].find(
        (p) => p === "family_tradition" || p === "several_fairly",
      );
      return { when: "from_age", perspective: ready ?? "several_fairly" };
    }
  }
}

export const MIN_AGE = 4;
export const MAX_AGE = 18;
export const clampAge = (age: number) => Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(age)));

// The age a "Not yet" starts at for one child: the pack's age if the answer came from a pack,
// else two years older than the child is now.
export function defaultAge(packAge: number | null | undefined, childAge: number): number {
  return clampAge(packAge ?? childAge + 2);
}

// birth_month is the first of the month, e.g. "2017-03-01".
export function ageFrom(birthMonth: string, now = new Date()): number {
  const [year, month] = birthMonth.split("-").map(Number);
  return now.getFullYear() - year - (now.getMonth() + 1 < month ? 1 : 0);
}

export const isWhen = (v: unknown): v is When => WHEN.includes(v as When);
export const isPerspective = (v: unknown): v is Perspective => PERSPECTIVE.includes(v as Perspective);
export const isAnswerId = (v: unknown): v is AnswerId => ANSWER_IDS.includes(v as AnswerId);
export const isLeanChoice = (v: unknown): v is LeanChoice => LEAN_CHOICES.includes(v as LeanChoice);
export const isPoint = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 24;

// What the tryout page (scripts/pack-compare.mts) hands over with "Copy my answers".
export type ChooserExport = {
  lean: LeanChoice;
  quick: string | null; // the quick-start pack's slug
  answers: { point: number; answer: AnswerId; pack: string | null }[];
};

export function parseChooserExport(text: string): ChooserExport | { error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text.trim());
  } catch {
    return { error: "That doesn't look like answers copied from the tryout page." };
  }
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (data.kind !== "quark-beliefs" || !data.mine || typeof data.mine !== "object") {
    return { error: "That doesn't look like answers copied from the tryout page." };
  }
  const slug = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{1,64}$/.test(v) ? v : null);

  const answers: ChooserExport["answers"] = [];
  for (const [key, value] of Object.entries(data.mine as Record<string, unknown>)) {
    const point = Number(key);
    const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    if (!isPoint(point) || !isAnswerId(v.a)) continue;
    answers.push({ point, answer: v.a, pack: slug(v.pack) });
  }
  answers.sort((a, b) => a.point - b.point);
  if (!answers.length) return { error: "There are no answers in what you pasted." };

  return { lean: isLeanChoice(data.lean) ? data.lean : "unset", quick: slug(data.quick), answers };
}
