// Is the trading boat here for the whole family, as the week build asks it (Brandon, 23 Nov 2026: no Puzzle cards
// while the boat is here; docs/week-without-hands-slice.md, 3)? The same tables and the same promise check as
// lib/boat-here.ts, which the wall asks for one child: the boat is here for a child when his times tables give it
// prices that lose no money (numbersProblem). The tables are one setting for the family, so the week asks it of
// every child, and builds without Puzzle only when the boat is here for all of them. A fault reading counts as not
// here, so the week is built whole, Puzzle and all, as before the boat. Relative imports with extensions, so the
// scripts and the app both load it.

import type { SupabaseClient } from "@supabase/supabase-js";
import { numbersProblem } from "../boat/day.ts";
import { boatNumbers, type Ladder, type Place } from "../../lib/ladder.ts";

export async function boatHereForFamily(db: SupabaseClient, familyId: string): Promise<boolean> {
  const kids = await db.from("children").select("id").eq("family_id", familyId);
  if (kids.error || !kids.data?.length) return false;
  const ids = (kids.data as { id: string }[]).map((k) => k.id);
  const [skills, placed] = await Promise.all([
    db.from("skills").select("key, ladder").eq("kind", "rung").not("key", "is", null),
    db.from("mastery").select("child_id, place, skills!inner(key)").in("child_id", ids).not("place", "is", null),
  ]);
  if (skills.error || placed.error) {
    console.error("week: the times tables could not be read, so the week is built with Puzzle:", (skills.error ?? placed.error)!.message);
    return false;
  }
  const rungs = (skills.data as { key: string; ladder: { rule?: Ladder["rungs"][number]["rule"] } | null }[]).map((s) => ({ key: s.key, rule: s.ladder?.rule ?? {} }));
  const rows = placed.data as unknown as { child_id: string; place: Place; skills: { key: string } }[];
  return ids.every((id) => {
    const places = new Map(rows.filter((r) => r.child_id === id).map((r) => [r.skills.key, r.place]));
    const nb = boatNumbers({ rungs } as unknown as Pick<Ladder, "rungs">, places);
    return !!nb && !numbersProblem(nb);
  });
}
