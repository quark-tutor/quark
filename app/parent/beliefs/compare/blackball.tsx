"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { liftBlackball, placeBlackball } from "./actions";
import styles from "../beliefs.module.css";

// Block a subject (tap twice), or lift your own block. Someone else's block can't be lifted here.
export function Blackball({ point, mine }: { point: number; mine: string | null }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = (call: () => Promise<{ error?: string }>) =>
    start(async () => {
      const result = await call().catch(() => ({ error: "Couldn't reach Quark. Check the connection." }));
      setError(result.error ?? null);
      router.refresh();
    });

  return (
    <span className={styles.blackball}>
      {mine ? (
        <button type="button" className={`${styles.btn} ${styles.quiet}`} disabled={pending} onClick={() => run(() => liftBlackball(mine))}>
          {pending ? "Lifting…" : "Lift my block"}
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btn} ${styles.warn}`}
          disabled={pending}
          onClick={() => {
            clearTimeout(timer.current);
            if (!armed) {
              setArmed(true);
              timer.current = setTimeout(() => setArmed(false), 4000);
              return;
            }
            setArmed(false);
            run(() => placeBlackball(point));
          }}
        >
          {pending ? "Blocking…" : armed ? "Tap again to block" : "Block this subject"}
        </button>
      )}
      {error ? (
        <span className={styles.flag} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
