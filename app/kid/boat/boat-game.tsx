"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Action, Screen } from "@/core/boat/game";
import { BOAT, SAY } from "@/core/wall/words";
import styles from "../kid.module.css";
import { NumberPad } from "../number-pad";
import { ReadAloud } from "../read-aloud";
import { Talk } from "../card/[id]/talk";
import { Crates } from "./crates";

// The trading boat's page (docs/trading-boat-slice.md). The server says what the screen is (core/boat/game.ts, view);
// this page shows it and sends each move to /api/kid/boat, which answers with the next screen. Nothing here decides
// anything: a number is read, and every total judged, on the server. Nothing plays by itself (rule 4).

type Move = Action | { type: "answer"; text: string };

// A short name for the screen's words, so "Read it to me" loads the new words when the screen changes.
const tag = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h.toString(36);
};

export function BoatGame({ initial }: { initial: Screen }) {
  const router = useRouter();
  const [screen, setScreen] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [didntSend, setDidntSend] = useState(false);

  async function send(move: Move): Promise<boolean> {
    if (busy) return false;
    setBusy(true);
    setDidntSend(false);
    const res = await fetch("/api/kid/boat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(move) }).catch(() => null);
    setBusy(false);
    if (res?.status === 401) {
      router.replace("/kid");
      return false;
    }
    if (res?.status === 404) {
      // The day moved on (the other iPad, or a new day): start from the screen as it is now.
      window.location.reload();
      return false;
    }
    const next = res?.ok ? ((await res.json().catch(() => null)) as Screen | null) : null;
    if (!next) {
      setDidntSend(true);
      return false;
    }
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }

  const s = screen;
  return (
    <div className={styles.boat}>
      {s.picture ? (
        <div className={styles.placeholder} aria-hidden>
          {s.picture}
        </div>
      ) : null}
      <section className={styles.words}>
        <h1 className={styles.cardTitle}>{s.title}</h1>
        {s.note ? <p className={styles.reply}>{s.note}</p> : null}
        {s.status ? (
          <div className={styles.status}>
            {s.status.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        {s.lines.map((line) => (
          <p key={line} className={styles.cardText}>
            {line}
          </p>
        ))}
        <ReadAloud key={`read:${s.speak}`} line={`boat.screen.${tag(s.speak)}`} />

        {s.offers ? (
          <div className={styles.offers}>
            {s.offers.map((o) => (
              <button key={o.offer} type="button" className={styles.offer} disabled={!o.open || busy} onClick={() => void send({ type: "pick", market: o.market, offer: o.offer })}>
                <span>{o.label}</span>
                <span className={styles.muted}>{o.left}</span>
              </button>
            ))}
          </div>
        ) : null}

        {s.stepper ? <Stepper key={`stepper:${s.speak}`} ask={s.stepper.ask} max={s.stepper.max} maxLine={s.stepper.maxLine} busy={busy} onPick={(n) => void send({ type: "count", n })} /> : null}

        {s.trade ? <TradeBox key={`trade:${s.speak}`} screen={s} busy={busy} onAnswer={(text) => send({ type: "answer", text })} /> : null}

        {s.buttons.length ? (
          <div className={styles.boatButtons}>
            {s.buttons.map((b) => (
              <button key={b.label} type="button" className={b.action.type === "next" || b.action.type === "sail" ? styles.send : styles.play} disabled={busy} onClick={() => void send(b.action)}>
                {b.label}
              </button>
            ))}
          </div>
        ) : null}
        {didntSend ? <p className={`${styles.reply} ${styles.notice}`}>{SAY.didntSend}</p> : null}
      </section>
    </div>
  );
}

// How many: − and +, never past the most he can choose, then "That many". It starts at nothing: nothing tells him how
// many (Brandon, 16 Nov 2026).
function Stepper({ ask, max, maxLine, busy, onPick }: { ask: string; max: number; maxLine: string | null; busy: boolean; onPick: (n: number) => void }) {
  const [n, setN] = useState(0);
  return (
    <div className={styles.ask}>
      <p className={styles.question}>{ask}</p>
      <div className={styles.stepper}>
        <button type="button" className={styles.key} disabled={n <= 0} onClick={() => setN((x) => Math.max(0, x - 1))} aria-label="One fewer">
          −
        </button>
        <span className={styles.stepValue}>{n}</span>
        <button type="button" className={styles.key} disabled={n >= max} onClick={() => setN((x) => Math.min(max, x + 1))} aria-label="One more">
          +
        </button>
        <button type="button" className={styles.send} disabled={n < 1 || busy} onClick={() => onPick(n)}>
          {BOAT.thatMany}
        </button>
      </div>
      {n >= max && maxLine ? <p className={styles.cardText}>{maxLine}</p> : null}
    </div>
  );
}

// A trade: the crates, the question with its sum beside it, what the tutor says back, the count's step, and the box.
function TradeBox({ screen, busy, onAnswer }: { screen: Screen; busy: boolean; onAnswer: (text: string) => Promise<boolean> }) {
  const t = screen.trade!;
  const [guess, setGuess] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim() || busy) return;
    if (await onAnswer(guess)) setGuess("");
  }
  return (
    <div className={styles.ask}>
      {t.pic ? <Crates pic={t.pic} /> : null}
      {t.lines.map((line) => (
        <p key={line} className={styles.cardText}>
          {line}
        </p>
      ))}
      <p className={styles.question}>{t.question}</p>
      <p className={styles.sumLine}>{t.sum}</p>
      {t.reply ? <p className={styles.reply}>{t.reply}</p> : null}
      {t.step ? (
        <>
          <p className={styles.question}>{t.step.ask}</p>
          <p className={styles.sumLine}>{t.step.sum}</p>
        </>
      ) : null}
      {t.ended ? t.ended.map((line) => <p key={line} className={styles.reply}>{line}</p>) : null}
      {t.answering ? (
        <form className={styles.answer} onSubmit={submit}>
          <input
            className={styles.box}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={SAY.typeHere}
            aria-label={SAY.typeHere}
            maxLength={200}
            enterKeyHint="send"
            autoComplete="off"
          />
          <button type="submit" className={styles.send} disabled={!guess.trim() || busy}>
            {SAY.send}
          </button>
          <NumberPad disabled={busy} onChange={(edit) => setGuess((g) => edit(g))} />
          <Talk disabled={busy} onHeard={(words) => setGuess((g) => (g.trim() ? `${g.trim()} ${words}` : words).slice(0, 200))} />
        </form>
      ) : null}
    </div>
  );
}
