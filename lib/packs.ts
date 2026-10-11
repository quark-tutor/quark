import { parse } from "yaml";

// A starter values pack: a community's position on each of the 24 points, plus the setting a
// family in that community would probably start from. Format: packs/DRAFTING-BRIEF.md.

export const WHEN = ["anytime", "from_age", "parent_led", "never"] as const;
export const PERSPECTIVE = ["family_tradition", "several_fairly", "omitted"] as const;
export const LEANS = ["progressive", "moderate", "conservative"] as const;
// The points whose pre-filled answer depends on the family's political lean.
export const LEAN_POINTS = [9, 10, 14, 15, 16, 17, 18, 19];

export type When = (typeof WHEN)[number];
export type Perspective = (typeof PERSPECTIVE)[number];
export type Lean = (typeof LEANS)[number];

export type EntryFields = {
  when: When;
  from_age: number | null;
  perspective: Perspective;
  position: string;
  source: string;
  split: string;
  handoff: string;
  parent_note: string;
};

export type PackEntry = EntryFields & {
  point: number;
  needs_check: boolean;
  by_lean?: Partial<Record<Lean, Partial<EntryFields>>>;
};

export type Pack = {
  pack: string;
  name: string;
  status: string;
  label: string;
  version: number;
  summary: string;
  sources: { id: string; title: string; publisher?: string; url: string }[];
  entries: PackEntry[];
};

export function parsePack(text: string): Pack {
  return parse(text) as Pack;
}

// The entry a family with this lean starts from: the base entry with its lean override applied.
export function entryForLean(entry: PackEntry, lean: Lean | "unset"): EntryFields {
  const override = lean === "unset" ? undefined : entry.by_lean?.[lean];
  const base: EntryFields = {
    when: entry.when,
    from_age: entry.from_age,
    perspective: entry.perspective,
    position: entry.position,
    source: entry.source,
    split: entry.split,
    handoff: entry.handoff,
    parent_note: entry.parent_note,
  };
  return { ...base, ...(override ?? {}) };
}

// Everything wrong with a pack, in plain words. Empty when it's valid.
export function validatePack(pack: Pack): string[] {
  const errors: string[] = [];
  if (!pack || typeof pack !== "object") return ["not a YAML mapping"];
  for (const key of ["pack", "name", "status", "label", "summary"] as const) {
    if (typeof pack[key] !== "string" || !pack[key].trim()) errors.push(`missing ${key}`);
  }
  if (pack.status !== "draft-by-outsiders" && pack.status !== "community-reviewed") {
    errors.push(`status must be draft-by-outsiders or community-reviewed`);
  }

  const sourceIds = new Set<string>();
  for (const s of pack.sources ?? []) {
    if (!s.id || !s.title || !s.url) errors.push(`source ${s.id ?? "?"} needs id, title and url`);
    else if (!/^https?:\/\//.test(s.url)) errors.push(`source ${s.id} url must be http(s)`);
    sourceIds.add(s.id);
  }
  if (sourceIds.size === 0) errors.push("no sources");

  const entries = pack.entries ?? [];
  const points = entries.map((e) => e.point);
  const expected = Array.from({ length: 24 }, (_, i) => i + 1);
  if (points.join() !== expected.join()) errors.push(`entries must be points 1-24 in order, got ${points.join(",")}`);

  const checkFields = (where: string, f: Partial<EntryFields>, full: boolean) => {
    if (full || f.when !== undefined) {
      if (!WHEN.includes(f.when as When)) errors.push(`${where}: when "${f.when}" is not one of ${WHEN.join(", ")}`);
    }
    if (full || f.perspective !== undefined) {
      if (!PERSPECTIVE.includes(f.perspective as Perspective)) {
        errors.push(`${where}: perspective "${f.perspective}" is not one of ${PERSPECTIVE.join(", ")}`);
      }
    }
    if (f.when === "from_age" && !(Number.isInteger(f.from_age) && f.from_age! >= 4 && f.from_age! <= 18)) {
      errors.push(`${where}: from_age must be a whole age when when is from_age`);
    }
    if (f.when === "never" && f.perspective !== undefined && f.perspective !== "omitted") {
      errors.push(`${where}: when never needs perspective omitted`);
    }
    if (full) {
      for (const key of ["position", "handoff"] as const) {
        if (typeof f[key] !== "string" || !f[key]!.trim()) errors.push(`${where}: missing ${key}`);
      }
    }
    if (f.source !== undefined) {
      const ids = String(f.source).match(/[a-z0-9][a-z0-9._-]*/gi) ?? [];
      if (!ids.some((id) => sourceIds.has(id))) errors.push(`${where}: source "${f.source}" names no listed source id`);
    }
  };

  for (const e of entries) {
    const where = `point ${e.point}`;
    checkFields(where, e, true);
    if (e.by_lean) {
      if (!LEAN_POINTS.includes(e.point)) errors.push(`${where}: by_lean is only for points ${LEAN_POINTS.join(", ")}`);
      for (const [lean, override] of Object.entries(e.by_lean)) {
        if (!LEANS.includes(lean as Lean)) errors.push(`${where}: unknown lean "${lean}"`);
        else if (override) checkFields(`${where} (${lean})`, { ...override, when: override.when ?? e.when }, false);
      }
    } else if (LEAN_POINTS.includes(e.point)) {
      errors.push(`${where}: missing by_lean`);
    }
  }
  return errors;
}
