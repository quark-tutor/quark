// The approval rule (docs/04, decided 13 Oct 2026): an item is approved automatically only when its
// license is CC0 or public domain and the model flagged nothing. Everything else waits for a
// guardian on /parent/content. Sources checked by hand are never approved automatically.

export const FLAGS = ["nudity", "violence", "frightening", "needs_review"] as const;
export type Flag = (typeof FLAGS)[number];

// Sources whose license a person confirms (content_sources.license_note).
export const CHECK_BY_HAND = new Set(["musopen"]);

export type Status = "approved" | "pending" | "manual";

export function isOpenLicense(license: string): boolean {
  return /^(cc0|public domain)\b/i.test(license.trim());
}

export function decide(input: { source: string; license: string; flags: readonly string[] }): {
  approved: boolean;
  approved_how: "auto" | null;
  status: Status;
} {
  if (CHECK_BY_HAND.has(input.source)) return { approved: false, approved_how: null, status: "manual" };
  if (isOpenLicense(input.license) && input.flags.length === 0) return { approved: true, approved_how: "auto", status: "approved" };
  return { approved: false, approved_how: null, status: "pending" };
}
