"use client";

import { useActionState } from "react";
import { setBoatTables, type BoatTablesState } from "./actions";
import styles from "./parent.module.css";

// The family's times tables for the trading boat: a place on each times-table rung, saved for every child at once
// (app/parent/actions.ts). A setting that would let a crate lose money comes back refused, with the reason.
const CHOICES = [
  { value: "", label: "Not yet" },
  { value: "working", label: "Working on" },
  { value: "done", label: "Done" },
] as const;

const start: BoatTablesState = {};

export function BoatTables({ rungs, setting }: { rungs: { key: string; name: string }[]; setting: Record<string, string | null> }) {
  const [state, action, pending] = useActionState(setBoatTables, start);
  return (
    <form action={action} className={styles.tables}>
      {rungs.map((r) => (
        <fieldset key={r.key} className={styles.tableRow}>
          <legend>{r.name}</legend>
          {CHOICES.map((c) => (
            <label key={c.value} className={styles.choice}>
              <input type="radio" name={r.key} value={c.value} defaultChecked={(setting[r.key] ?? "") === c.value} /> {c.label}
            </label>
          ))}
        </fieldset>
      ))}
      <p className={styles.row}>
        <button className={styles.button} disabled={pending}>
          {pending ? "Saving…" : "Save the times tables"}
        </button>
        {state.saved && !pending ? <span className={styles.muted}>Saved.</span> : null}
      </p>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
    </form>
  );
}
