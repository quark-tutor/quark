"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lineId, type AnswerReply, type CardReply } from "@/core/wall/card";
import { SAY } from "@/core/wall/words";
import styles from "../../kid.module.css";
import { ReadAloud } from "../../read-aloud";
import { Talk } from "./talk";

// The question, one box and one button. Guess first: a hint comes only after a guess, one at a time, and
// after the last one, one more guess, then the handoff to a person. The screen never gives the answer; the
// server judges the guess and says only what comes next (core/wall/flow.ts). Each guess stays on screen beside
// the reply it got, right or not (Brandon, 22 Oct 2026); it is kept only on this page, so after a reload the
// hints come back from the database without the guesses that earned them.

type End =
  | { kind: "handed_off" | "open" | "answered"; handoff: string }
  | { kind: "deeper"; next: string };

type Props = { id: string; question: string; hints: string[]; state: CardReply["state"]; handoff: string | null };

export function AnswerBox({ id, question, hints: seen, state, handoff }: Props) {
  const router = useRouter();
  const [hints, setHints] = useState(seen);
  // The guess that earned each hint, on this page; null for a hint seen before it loaded.
  const [guesses, setGuesses] = useState<(string | null)[]>(() => seen.map(() => null));
  // The guess that ended the layer: right, open, or the one before the handoff.
  const [last, setLast] = useState<string | null>(null);
  const [end, setEnd] = useState<End | null>(state !== "answering" && handoff !== null ? { kind: state, handoff } : null);
  const [guess, setGuess] = useState("");
  const [notice, setNotice] = useState<"guessFirst" | "didntSend" | null>(null);
  const [sending, setSending] = useState(false);
  // Seconds from the question, or the last hint, shown to the guess.
  const since = useRef(0);
  const box = useRef<HTMLInputElement>(null);
  const reply = useRef<HTMLDivElement>(null);

  useEffect(() => {
    since.current = performance.now();
  }, []);

  useEffect(() => {
    reply.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [hints.length, end, notice]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim() || sending) return;
    setSending(true);
    setNotice(null);
    const seconds = Math.round((performance.now() - since.current) / 1000);
    const res = await fetch("/api/kid/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: id, guess, seconds }),
    }).catch(() => null);
    setSending(false);
    if (res && (res.status === 401 || res.status === 404)) {
      // The card isn't on the wall any more (a new day, or the week was taken back): back to the wall.
      router.replace("/kid");
      return;
    }
    const r = res?.ok ? ((await res.json().catch(() => null)) as AnswerReply | null) : null;
    if (!r) {
      setNotice("didntSend");
      return;
    }
    since.current = performance.now();
    if (r.outcome === "guess_first") {
      setNotice("guessFirst");
      return;
    }
    const said = guess.trim();
    setGuess("");
    if (r.outcome === "not_yet") {
      if (r.hint) {
        setGuesses((g) => [...g, said]);
        setHints((h) => [...h, r.hint!]);
      }
      return;
    }
    setLast(said);
    if (r.outcome === "right" && r.next) setEnd({ kind: "deeper", next: r.next });
    else if (r.outcome === "right" && r.handoff) setEnd({ kind: "answered", handoff: r.handoff });
    else if (r.outcome === "open" && r.handoff) setEnd({ kind: "open", handoff: r.handoff });
    else if (r.outcome === "handoff" && r.handoff) setEnd({ kind: "handed_off", handoff: r.handoff });
  }

  return (
    <div className={styles.ask}>
      <p className={styles.question}>{question}</p>
      {hints.map((h, i) => (
        <Fragment key={i}>
          {guesses[i] ? <p className={styles.said}>{guesses[i]}</p> : null}
          <p className={styles.reply}>{SAY.thinkAbout}</p>
          <div className={styles.hint}>
            <p>{h}</p>
            <ReadAloud line={lineId(id, i)} small />
          </div>
        </Fragment>
      ))}
      <div ref={reply}>
        {end ? (
          <Ending id={id} end={end} guess={last} />
        ) : (
          <form className={styles.answer} onSubmit={send}>
            <input
              ref={box}
              className={styles.box}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onFocus={() => setTimeout(() => box.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 300)}
              placeholder={SAY.typeHere}
              aria-label={SAY.typeHere}
              maxLength={200}
              enterKeyHint="send"
              autoComplete="off"
            />
            <button type="submit" className={styles.send} disabled={!guess.trim() || sending}>
              {SAY.send}
            </button>
            <Talk disabled={sending} onHeard={(words) => setGuess((g) => (g.trim() ? `${g.trim()} ${words}` : words).slice(0, 200))} />
            {notice ? <p className={`${styles.reply} ${styles.notice}`}>{notice === "guessFirst" ? SAY.guessFirst : SAY.didntSend}</p> : null}
          </form>
        )}
      </div>
    </div>
  );
}

function Ending({ id, end, guess }: { id: string; end: End; guess: string | null }) {
  const said = guess ? <p className={styles.said}>{guess}</p> : null;
  if (end.kind === "deeper") {
    return (
      <div className={styles.ending}>
        {said}
        <p className={styles.reply}>{SAY.right}</p>
        <Link href={`/kid/card/${end.next}`} prefetch={false} className={styles.deeper}>
          {SAY.deeper}
        </Link>
      </div>
    );
  }
  return (
    <div className={styles.ending}>
      {said}
      {end.kind === "answered" ? <p className={styles.reply}>{SAY.right}</p> : null}
      <p className={styles.reply}>{end.kind === "open" ? SAY.toTalkAbout : SAY.forAPerson}</p>
      <div className={styles.handoff}>
        <p>{end.handoff}</p>
        <ReadAloud line={lineId(id, "handoff")} small />
      </div>
    </div>
  );
}
