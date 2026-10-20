"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { answerTestQuestion, startTestRun, type TestResult } from "./actions";
import styles from "../beliefs.module.css";

// The twenty questions, for one child: a button that runs them one at a time, each answer shown as
// it arrives, and the last run kept for every guardian (docs/gate-slice.md, decisions 11 and 12).

export type KeptRun = {
  startedAt: string;
  finished: boolean;
  results: TestResult[];
  rulebookChanged: boolean; // the rulebook has changed since this run
  floorVersion: number;
};

const TOTAL = 20;

export function TestRun({ childId, nickname, kept, floorFirstGuess }: { childId: string; nickname: string; kept: KeptRun | null; floorFirstGuess: boolean }) {
  const router = useRouter();
  const [live, setLive] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setLive([]);
    try {
      const started = await startTestRun(childId);
      if ("error" in started) throw new Error(started.error);
      for (const id of started.questions) {
        const answered = await answerTestQuestion(started.runId, id);
        if ("error" in answered) throw new Error(answered.error);
        setLive((prev) => [...(prev ?? []), answered.result]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reach Quark. Check the connection.");
    } finally {
      setRunning(false);
      router.refresh();
    }
  }

  const results = live ?? kept?.results ?? [];
  const marked = results.filter((r) => r.ok !== null);
  const follow = marked.filter((r) => r.ok).length;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <strong>{nickname}</strong>
        <button type="button" className={styles.btn} disabled={running} onClick={run}>
          {running ? `Answering ${Math.min((live?.length ?? 0) + 1, TOTAL)} of ${TOTAL}…` : `Run it for ${nickname}`}
        </button>
      </div>
      <p className={styles.meta}>A few minutes; about 40 cents.</p>
      {error ? (
        <p className={styles.flag} role="alert">
          {error}
        </p>
      ) : null}
      {!live && kept ? (
        <p className={styles.meta}>
          Last run for {nickname}: {new Date(kept.startedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}.{" "}
          {kept.finished ? "" : `It stopped after ${kept.results.length} of ${TOTAL}. `}
          {marked.length ? `${follow} of ${marked.length} follow the rulebook.` : ""} Answered under safety floor version {kept.floorVersion}
          {floorFirstGuess ? ", still a first guess" : ""}.
        </p>
      ) : null}
      {!live && kept?.rulebookChanged ? (
        <p className={styles.flag}>The rulebook has changed since this run. Run it again to see the answers under the new one.</p>
      ) : null}
      {results.length ? (
        <ol className={styles.rulebook}>
          {results.map((r) => (
            <li key={r.id}>
              <strong>{r.question}</strong>
              <details>
                <summary>{r.answer.length > 140 ? `${r.answer.slice(0, 140)}…` : r.answer}</summary>
                <p>{r.answer}</p>
              </details>
              <p className={r.ok === false ? styles.flag : styles.meta}>
                {r.rule} {said(r)}
                {r.ok === true ? " ✓" : r.ok === false ? ` ✗ (the rulebook says ${wants(r)})` : " Read it yourself."}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

const said = (r: TestResult) => (r.declined ? "Declined." : r.handed_off ? "Handed off." : "Answered.");
const wants = (r: TestResult) => (r.expected === "hand_off" ? "hand off" : r.expected === "decline" ? "decline" : "answer");
