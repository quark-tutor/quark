"use client";

import { useActionState } from "react";
import { backToReview, makeWeekLive } from "./actions";
import parent from "../../parent.module.css";
import styles from "../../beliefs/beliefs.module.css";

// The one button on the week page: "Looks good" while the week is in review, and "Take it back to review"
// while it is live and has not begun. The reason for a refusal comes back from the server and shows here.
export function LooksGood({ themeId, mode, blocked }: { themeId: string; mode: "tap" | "undo"; blocked: boolean }) {
  const [state, action, pending] = useActionState(mode === "tap" ? makeWeekLive.bind(null, themeId) : backToReview.bind(null, themeId), null);
  return (
    <form action={action}>
      <p>
        <button className={parent.button} disabled={pending || blocked}>
          {mode === "tap" ? "Looks good" : "Take it back to review"}
        </button>
      </p>
      {state ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? styles.meta : styles.flag}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
