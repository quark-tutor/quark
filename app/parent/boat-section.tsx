import type { Place } from "@/lib/ladder";
import { checkSetting, pricesLine, settingOf, timesRungs } from "@/lib/boat-setting";
import { createClient } from "@/lib/supabase/server";
import { setBoat } from "./actions";
import { BoatLog } from "./boat-log";
import { BoatTables } from "./boat-tables";
import styles from "./parent.module.css";

// The trading boat on /parent (docs/trading-boat-2-slice.md): the family's switch, its times tables (one setting, the
// same prices for every child), what prices they give, and, while the switch is on, the log of each child's trades.
// Read through the guardian's own session, so row-level security keeps it to the family. Any guardian changes either.
export async function BoatSection({ kids }: { kids: { id: string; nickname: string }[] }) {
  const supabase = await createClient();
  const [family, skills, placed] = await Promise.all([
    supabase.from("families").select("boat_on").single(),
    supabase.from("skills").select("id, key, name, position, ladder").eq("kind", "rung").not("key", "is", null),
    supabase.from("mastery").select("child_id, place, skills!inner(key)").not("place", "is", null),
  ]);
  if (family.error || skills.error || placed.error) {
    return (
      <section className={styles.section}>
        <h2>The trading boat</h2>
        <p className={styles.muted}>The trading boat&rsquo;s settings could not be read.</p>
      </section>
    );
  }

  const on = (family.data as { boat_on: boolean }).boat_on;
  const rungs = timesRungs(skills.data);
  const rows = placed.data as unknown as { child_id: string; place: Place; skills: { key: string } }[];
  const { setting, differ } = settingOf(
    rungs,
    kids.map((k) => new Map(rows.filter((r) => r.child_id === k.id).map((r) => [r.skills.key, r.place]))),
  );
  const check = rungs.length ? checkSetting(rungs, setting) : null;
  const nb = check && "nb" in check ? check.nb : null;
  const name = new Map(rungs.map((r) => [r.key, r.name]));

  return (
    <section className={styles.section}>
      <h2>The trading boat</h2>
      <p className={styles.muted}>
        Math as a trading game: each child buys crates at the markets and tells the trader what they owe. Every child
        gets the same prices, from the times tables below; each has their own markets and rumors.
      </p>
      <p>
        {on
          ? nb
            ? "On. The trading boat takes Puzzle's place on the wall."
            : "On, but the times tables below give it no prices, so the wall still shows Puzzle."
          : "Off. Puzzle is on the wall."}
      </p>
      <form action={setBoat.bind(null, !on)} className={styles.row}>
        <button className={on ? styles.danger : styles.button}>{on ? "Turn the trading boat off" : "Turn the trading boat on"}</button>
      </form>

      <h3>Times tables</h3>
      {rungs.length === 0 ? (
        <p className={styles.muted}>The math ladder isn&rsquo;t loaded on this copy of Quark yet.</p>
      ) : (
        <>
          <p className={styles.muted}>One setting for the family. Every child&rsquo;s prices come from it.</p>
          {differ.length ? (
            <p className={styles.muted}>
              The children&rsquo;s places differ on {differ.map((k) => name.get(k)).join(" and ")}. Saving sets them the same.
            </p>
          ) : null}
          <BoatTables rungs={rungs.map(({ key, name }) => ({ key, name }))} setting={Object.fromEntries(setting)} />
          <p>{nb ? pricesLine(nb) : check && "error" in check ? check.error : null}</p>
        </>
      )}

      {on ? <BoatLog kids={kids} /> : null}
    </section>
  );
}
