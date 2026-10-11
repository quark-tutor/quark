// The values vocabulary shared by packs, the beliefs page and the gate. Mirrors the enums in
// deploy/supabase/schema.sql. No dependencies, so the browser can use it too.

export const WHEN = ["anytime", "from_age", "parent_led", "never"] as const;
export const PERSPECTIVE = ["family_tradition", "several_fairly", "omitted"] as const;
export const LEANS = ["progressive", "moderate", "conservative"] as const;
// The points whose pre-filled answer depends on the family's political lean.
export const LEAN_POINTS = [9, 10, 14, 15, 16, 17, 18, 19];

export type When = (typeof WHEN)[number];
export type Perspective = (typeof PERSPECTIVE)[number];
export type Lean = (typeof LEANS)[number];

// How a child learns to act, per tradition (packs/README.md, "Pack-level fields").
export const LEARNS_TO_ACT = ["exemplars", "consideration", "practice", "mixed"] as const;
export type LearnsToAct = (typeof LEARNS_TO_ACT)[number];
export const LEARNS_LABELS: [LearnsToAct, string][] = [
  ["exemplars", "By copying people who acted well"],
  ["consideration", "By noticing others and thinking first"],
  ["practice", "By practice, until it's a habit"],
  ["mixed", "A mix of these"],
];
export const isLearnsToAct = (v: unknown): v is LearnsToAct => LEARNS_TO_ACT.includes(v as LearnsToAct);
