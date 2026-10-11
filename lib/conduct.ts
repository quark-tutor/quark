// How the tutor conducts itself: the four family items of Part 2b (gate/values-interview.md) and
// docs/12-teaching-that-tests-itself.md, "Conduct the tutor teaches". The floor items aren't
// here; they can't be changed. No dependencies, so the browser can use it too.

export type ConductKey =
  | "conduct.speak_first"
  | "conduct.crude_line"
  | "conduct.rudeness"
  | "conduct.praise"
  | "conduct.praise_words";

export type Choice = { id: string; label: string };

// Questions with fixed answers. Choices run gentlest first: where guardians differ, or one hasn't
// answered yet, the first of their choices applies.
export const CONDUCT_CHOICES = {
  "conduct.speak_first": [
    { id: "off", label: "Off for this child" },
    { id: "gentle", label: "Gentle reminder" },
    { id: "required", label: "Required" },
  ],
  "conduct.rudeness": [
    { id: "quiet", label: "Quiet non-response" },
    { id: "correct", label: "One-line correction" },
  ],
  "conduct.praise": [
    { id: "warm", label: "Warm" },
    { id: "plain", label: "Plain acknowledgement" },
    { id: "none", label: "None" },
  ],
} as const satisfies Record<string, readonly Choice[]>;

export type ChoiceKey = keyof typeof CONDUCT_CHOICES;
export const CHOICE_KEYS = Object.keys(CONDUCT_CHOICES) as ChoiceKey[];
// conduct.speak_first takes a value for each child.
export const PER_CHILD: readonly ConductKey[] = ["conduct.speak_first"];
// Free text only.
export const TEXT_KEYS: readonly ConductKey[] = ["conduct.crude_line", "conduct.praise_words"];
export const CONDUCT_KEYS: readonly ConductKey[] = [...CHOICE_KEYS, ...TEXT_KEYS];

export const CONDUCT_QUESTIONS: Record<ConductKey, string> = {
  "conduct.speak_first": "Should the tutor make the child say an answer out loud before any hint?",
  "conduct.crude_line": "What counts as a crude question in your house?",
  "conduct.rudeness": "If a child is rude to the tutor, what should it do?",
  "conduct.praise": "Should the tutor praise, and how?",
  "conduct.praise_words": "Words to use or avoid when it praises",
};

export const isConductKey = (v: unknown): v is ConductKey => CONDUCT_KEYS.includes(v as ConductKey);
export const isChoiceKey = (v: unknown): v is ChoiceKey => CHOICE_KEYS.includes(v as ChoiceKey);
export const isChoice = (key: ChoiceKey, v: unknown) => CONDUCT_CHOICES[key].some((c) => c.id === v);

export const gentlest = (key: ChoiceKey) => CONDUCT_CHOICES[key][0].id;

// The gentler of several answers.
export function gentler(key: ChoiceKey, values: string[]): string {
  const order: readonly string[] = CONDUCT_CHOICES[key].map((c) => c.id);
  const ranks = values.map((v) => order.indexOf(v)).filter((i) => i >= 0);
  return order[ranks.length ? Math.min(...ranks) : 0];
}

export const choiceLabel = (key: ChoiceKey, id: string | null | undefined) =>
  CONDUCT_CHOICES[key].find((c) => c.id === id)?.label ?? null;

// One guardian's conduct answer, as stored in guardian_conduct.
export type ConductAnswer = { key: ConductKey; childId: string | null; value: string | null; note: string | null };
