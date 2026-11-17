import "server-only";
import { numbersProblem } from "@/core/boat/day";
import type { Ctx } from "@/core/boat/game";
import { todayIn } from "@/core/curation/week";
import type { Device } from "@/lib/device";
import { wallNow } from "@/lib/dev-view";
import { boatNumbers, type Ladder, type Place } from "@/lib/ladder";
import { createAdminClient } from "@/lib/supabase/admin";

// Is the trading boat here for this iPad's child? The one place that asks (docs/trading-boat-2-slice.md, What is built
// 1): the family's switch is on (families.boat_on, a guardian's tap on /parent), and the family's times tables give him
// prices that keep slice 1's promise (numbersProblem()). The answer is the game's context: his seed, his numbers and
// today where the family lives (the test view's day on the dev server). lib/boat.ts asks it before every read and write,
// and lib/wall.ts asks it for the Puzzle slot, so the wall, the card pages, the boat and its routes always agree.
//
// With the switch off it reads the switch and nothing else. A fault reading anything counts as off, with one line saying
// so, so the boat can never break the wall: off, the wall is as it was, Puzzle in its place.
export async function boatHere(device: Device): Promise<Ctx | null> {
  const db = createAdminClient();
  const family = await db.from("families").select("timezone, boat_on").eq("id", device.familyId).single();
  if (family.error) {
    console.error("boat: the switch could not be read, so the boat is off:", family.error.message);
    return null;
  }
  const { timezone, boat_on } = family.data as { timezone: string; boat_on: boolean };
  if (!boat_on) return null;
  const [skills, placed] = await Promise.all([
    db.from("skills").select("key, ladder").eq("kind", "rung").not("key", "is", null),
    db.from("mastery").select("place, skills!inner(key)").eq("child_id", device.childId).not("place", "is", null),
  ]);
  if (skills.error || placed.error) {
    console.error("boat: the times tables could not be read, so the boat is off:", (skills.error ?? placed.error)!.message);
    return null;
  }
  const rungs = (skills.data as { key: string; ladder: { rule?: Ladder["rungs"][number]["rule"] } | null }[]).map((s) => ({ key: s.key, rule: s.ladder?.rule ?? {} }));
  const places = new Map((placed.data as unknown as { place: Place; skills: { key: string } }[]).map((p) => [p.skills.key, p.place]));
  const nb = boatNumbers({ rungs } as unknown as Pick<Ladder, "rungs">, places);
  if (!nb || numbersProblem(nb)) return null;
  return { seed: device.childId, nb, date: todayIn(timezone, await wallNow()) };
}
