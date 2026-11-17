import "server-only";
import { numbersProblem } from "@/core/boat/day";
import type { Ctx } from "@/core/boat/game";
import { todayIn } from "@/core/curation/week";
import type { Device } from "@/lib/device";
import { wallNow } from "@/lib/dev-view";
import { boatNumbers, type Ladder, type Place } from "@/lib/ladder";
import { createAdminClient } from "@/lib/supabase/admin";

// Is the trading boat here for this iPad's child? The one place that asks (docs/trading-boat-2-slice.md, What is built
// 1, as changed at stop 2's fix round): the family's times tables give him prices that keep slice 1's promise
// (numbersProblem()). There is no switch (Brandon, 17 Nov 2026: "release the math trading game in place of the
// puzzle"): the tables are set for the family on /parent or by `npm run boat:tables`, and with no table working on or
// done the boat is not here and Puzzle is, as before the boat. The answer is the game's context: his seed, his numbers
// and today where the family lives (the test view's day on the dev server). lib/boat.ts asks it before every read and
// write, and lib/wall.ts asks it for the Puzzle slot, so the wall, the card pages, the boat and its routes always agree.
//
// A fault reading anything counts as not here, with one line saying so, so the boat can never break the wall: the wall
// is as it was, Puzzle in its place.
export async function boatHere(device: Device): Promise<Ctx | null> {
  const db = createAdminClient();
  const [family, skills, placed] = await Promise.all([
    db.from("families").select("timezone").eq("id", device.familyId).single(),
    db.from("skills").select("key, ladder").eq("kind", "rung").not("key", "is", null),
    db.from("mastery").select("place, skills!inner(key)").eq("child_id", device.childId).not("place", "is", null),
  ]);
  const fault = family.error ?? skills.error ?? placed.error;
  if (fault) {
    console.error("boat: the times tables could not be read, so the boat is not here:", fault.message);
    return null;
  }
  const rungs = (skills.data as { key: string; ladder: { rule?: Ladder["rungs"][number]["rule"] } | null }[]).map((s) => ({ key: s.key, rule: s.ladder?.rule ?? {} }));
  const places = new Map((placed.data as unknown as { place: Place; skills: { key: string } }[]).map((p) => [p.skills.key, p.place]));
  const nb = boatNumbers({ rungs } as unknown as Pick<Ladder, "rungs">, places);
  if (!nb || numbersProblem(nb)) return null;
  const { timezone } = family.data as { timezone: string };
  return { seed: device.childId, nb, date: todayIn(timezone, await wallNow()) };
}
