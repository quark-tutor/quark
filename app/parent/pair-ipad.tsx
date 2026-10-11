"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createPairingCode, type PairingState } from "./actions";
import styles from "./parent.module.css";

type Child = { id: string; nickname: string };

const start: PairingState = {};

export function PairIpad({ kids }: { kids: Child[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createPairingCode, start);
  const [dismissed, setDismissed] = useState<string | undefined>();

  if (state.code && state.code !== dismissed) {
    const until = state.expiresAt
      ? new Date(state.expiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "";
    return (
      <div className={styles.pairing}>
        <p>On {state.nickname}&rsquo;s iPad, open Quark from the Home Screen and type:</p>
        <p className={styles.code}>
          {state.code.slice(0, 3)} {state.code.slice(3)}
        </p>
        <p className={styles.muted}>Works once, until {until}.</p>
        <button
          className={styles.button}
          onClick={() => {
            setDismissed(state.code);
            router.refresh();
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (kids.length === 0) {
    return <p className={styles.muted}>Add a child first (see deploy/README.md), then pair an iPad.</p>;
  }

  return (
    <form action={action} className={styles.row}>
      <label className={styles.label}>
        Pair an iPad for
        <select name="childId" className={styles.select} defaultValue={kids[0].id}>
          {kids.map((kid) => (
            <option key={kid.id} value={kid.id}>
              {kid.nickname}
            </option>
          ))}
        </select>
      </label>
      <button className={styles.button} disabled={pending}>
        {pending ? "Making a code…" : "Get a code"}
      </button>
      {state.error && <p className={styles.error}>{state.error}</p>}
    </form>
  );
}
