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
