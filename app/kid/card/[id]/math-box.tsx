"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lineId, type AnswerReply, type MathPage } from "@/core/wall/card";
import type { MathLine, MathView } from "@/core/wall/math";
import { SAY } from "@/core/wall/words";
import styles from "../../kid.module.css";
import { MathPicture } from "../../math-picture";
import { ReadAloud } from "../../read-aloud";
import { Talk } from "./talk";

// A part of a math problem (docs/math-tile-slice.md, What is built 6): the question, then the tutor's moves as the
// server gives them, one at a time, and the box. A wrong answer earns no clue: "How did you get that?", then the
// question another way, then one small step at a time, then something he knows and the question a third way, then a
// person. A number is read on the server, in code; the page only shows what the server says comes next. He answers
// by the number pad, by typing ("six", "6 sets") or by Talk. After a right answer: "That's it.", "Here's the whole
// thing:" and the working, then the next part. On the first part of a rung new to him, the worked example comes first.

type Props = { id: string; question: string; page: MathPage };

const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function Line({ l }: { l: MathLine }) {
  return (
    <>
      {l.say ? <p className={styles.reply}>{SAY[l.say]}</p> : null}
      {l.text ? (
        <div className={styles.hint}>
          <p>{l.text}</p>
          {l.line ? <ReadAloud line={l.line} small /> : null}
        </div>
      ) : null}
    </>
  );
}

export function MathBox({ id, question, page }: Props) {
  const router = useRouter();
  const [view, setView] = useState<MathView>(page.view);
  const [example, setExample] = useState(!!page.example);
  const [said, setSaid] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [notice, setNotice] = useState<"guessFirst" | "didntSend" | null>(null);
  const [sending, setSending] = useState(false);
  const since = useRef(0);
  const box = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    since.current = performance.now();
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [view, notice]);

  if (example && page.example) {
    return (
      <div className={styles.ask}>
        <p className={styles.reply}>{SAY.workedOut}</p>
        <MathPicture picture={page.example.picture} />
        <div className={styles.hint}>
          <p>{page.example.text}</p>
          <ReadAloud line={`${id}.example`} small />
        </div>
        {page.example.working.map((w) => (
          <p key={w} className={styles.working}>
            {w}
          </p>
        ))}
        <button type="button" className={styles.deeper} onClick={() => setExample(false)}>
          {SAY.nowYours}
        </button>
      </div>
    );
  }

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
      router.replace("/kid");
      return;
    }
    const r = res?.ok ? ((await res.json().catch(() => null)) as AnswerReply | null) : null;
    if (!r) return setNotice("didntSend");
    if (r.outcome === "guess_first") return setNotice("guessFirst");
    if (r.outcome !== "math" || !r.math) return setNotice("didntSend");
    since.current = performance.now();
    setSaid(guess.trim());
    setGuess("");
    setView(r.math);
  }

  const done = view.asking === null;
  return (
    <div className={styles.ask}>
      {page.before.length ? (
        <div className={styles.soFar}>
          <p className={styles.reply}>{SAY.soFar}</p>
          {page.before.map((b, i) => (
            <p key={i} className={styles.soFarLine}>
              {b.question} <strong>{b.answer}</strong>
            </p>
          ))}
        </div>
      ) : null}
      <p className={styles.question}>{question}</p>
      {view.lines.map((l, i) => (
        <Line key={i} l={l} />
      ))}
      <div ref={bottom} className={styles.ask}>
        {said && !done ? <p className={styles.said}>{said}</p> : null}
        {done ? (
          <div className={styles.ending}>
            {said ? <p className={styles.said}>{said}</p> : null}
            {view.handedOff ? null : (
              <>
                {view.rightSaid ? null : <p className={styles.reply}>{SAY.right}</p>}
                <p className={styles.reply}>{SAY.wholeThing}</p>
                {(view.working ?? []).map((w, i) => (
                  <div key={i} className={styles.workingRow}>
                    <p className={styles.working}>{w}</p>
                    {i === (view.working ?? []).length - 1 ? <ReadAloud line={`${id}.working`} small /> : null}
                  </div>
                ))}
              </>
            )}
            {view.next ? (
              <Link href={`/kid/card/${view.next}`} prefetch={false} className={styles.deeper}>
                {SAY.nextPart}
              </Link>
            ) : null}
            {view.handoff ? (
              <>
                <p className={styles.reply}>{SAY.forAPerson}</p>
                <div className={styles.handoff}>
                  <p>{view.handoff}</p>
                  <ReadAloud line={lineId(id, "handoff")} small />
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <>
            {view.prompt ? (
              view.prompt.say ? (
                <p className={styles.reply}>{SAY[view.prompt.say]}</p>
              ) : view.lines.length ? (
                <p className={styles.again}>{view.prompt.text}</p>
              ) : null
            ) : null}
            <form className={styles.answer} onSubmit={send}>
              <input
                ref={box}
                className={styles.box}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder={view.asking === "words" ? SAY.tellHow : SAY.typeHere}
                aria-label={view.asking === "words" ? SAY.tellHow : SAY.typeHere}
                maxLength={200}
                enterKeyHint="send"
                autoComplete="off"
              />
              <button type="submit" className={styles.send} disabled={!guess.trim() || sending}>
                {SAY.send}
              </button>
              {view.asking === "number" ? (
                <div className={styles.numberPad}>
                  {PAD.map((d) => (
                    <button key={d} type="button" className={styles.key} onClick={() => setGuess((g) => `${g}${d}`.slice(0, 200))}>
                      {d}
                    </button>
                  ))}
                  <button type="button" className={styles.keySmall} onClick={() => setGuess((g) => g.slice(0, -1))}>
                    {SAY.deleteDigit}
                  </button>
                </div>
              ) : null}
              <Talk disabled={sending} onHeard={(words) => setGuess((g) => (g.trim() ? `${g.trim()} ${words}` : words).slice(0, 200))} />
              {notice ? (
                <p className={`${styles.reply} ${styles.notice}`}>{notice === "guessFirst" ? SAY.guessFirst : SAY.didntSend}</p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
