import { boatLine, familySetting, pricesLine, type PlacedRow } from "@/lib/boat-setting";
import { createClient } from "@/lib/supabase/server";
import { BoatLog } from "./boat-log";
import { BoatTables } from "./boat-tables";
import styles from "./parent.module.css";

// The trading boat on /parent (docs/trading-boat-2-slice.md, as changed at stop 2's fix round): the family's times
// tables (one setting, the same prices for every child), whether they put the boat on the wall and what prices they
// give, and, while it is on the wall, the log of each child's trades. There is no switch (Brandon, 17 Nov 2026): the
// tables are the way on and off. Read through the guardian's own session, so row-level security keeps it to the
// family. Any guardian changes the setting.
export async function BoatSection({ kids }: { kids: { id: string; nickname: string }[] }) {
  const supabase = await createClient();
  const [skills, placed] = await Promise.all([
    supabase.from("skills").select("id, key, name, position, ladder").eq("kind", "rung").not("key", "is", null),
    supabase.from("mastery").select("child_id, place, skills!inner(key)").not("place", "is", null),
  ]);
  if (skills.error || placed.error) {
    return (
      <section className={styles.section}>
        <h2>The trading boat</h2>
        <p className={styles.muted}>The trading boat&rsquo;s settings could not be read.</p>
      </section>
    );
  }

  const { rungs, setting, differ, check } = familySetting(skills.data, kids, placed.data as unknown as PlacedRow[]);
  const nb = check && "nb" in check ? check.nb : null;
  const name = new Map(rungs.map((r) => [r.key, r.name]));

  return (
    <section className={styles.section}>
      <h2>The trading boat</h2>
      <p className={styles.muted}>
        Math as a trading game, in Puzzle&rsquo;s place on the wall: each child buys crates at the markets and tells the
        trader what they owe. Every child gets the same prices, from the times tables below; each has their own markets
        and rumors.
      </p>
      {rungs.length === 0 ? (
        <p className={styles.muted}>The math ladder isn&rsquo;t loaded on this copy of Quark yet, so the wall shows Puzzle.</p>
      ) : (
        <>
          <p>{check ? boatLine(check) : null}</p>
          <h3>Times tables</h3>
          <p className={styles.muted}>
            One setting for the family. Every child&rsquo;s prices come from it. To take the boat off the wall, set every
            table to not yet: Puzzle is back at once, and each child&rsquo;s game waits where they left it.
          </p>
          {differ.length ? (
            <p className={styles.muted}>
              The children&rsquo;s places differ on {differ.map((k) => name.get(k)).join(" and ")}. Saving sets them the same.
            </p>
          ) : null}
          <BoatTables rungs={rungs.map(({ key, name }) => ({ key, name }))} setting={Object.fromEntries(setting)} />
          <p>{nb ? pricesLine(nb) : check && "error" in check ? check.error : null}</p>
        </>
      )}

      {nb ? <BoatLog kids={kids} /> : null}
    </section>
  );
}
