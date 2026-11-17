import { dayLogs, type TurnRow } from "@/core/boat/log";
import { createClient } from "@/lib/supabase/server";
import styles from "./parent.module.css";

// The trading boat's log for the parents (docs/trading-boat-slice.md, stop 2): each day's trades for each child,
// every sum and what he said to it (core/boat/log.ts). Shown inside the boat's section on /parent while the family's
// switch is on (docs/trading-boat-2-slice.md); read through the guardian's own session, so row-level security keeps it
// to the family.
export async function BoatLog({ kids }: { kids: { id: string; nickname: string }[] }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boat_turns")
    .select("child_id, day, played_on, trade, kind, island, good, count, price, step, expected, answer, verdict, short, money")
    .order("created_at");
  const rows = (data ?? []) as (TurnRow & { child_id: string })[];
  return (
    <>
      <h3>What each child traded</h3>
      {error ? <p className={styles.muted}>The trading boat&rsquo;s log could not be read.</p> : null}
      {kids.map((kid) => {
        const days = dayLogs(rows.filter((r) => r.child_id === kid.id));
        return (
          <div key={kid.id}>
            <h4>{kid.nickname}</h4>
            {days.length === 0 ? <p className={styles.muted}>No trading yet.</p> : null}
            {days.map((d) => (
              <div key={d.head}>
                <p className={styles.row}>
                  <strong>{d.head}</strong>
                </p>
                <ul className={styles.list}>
                  {d.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
