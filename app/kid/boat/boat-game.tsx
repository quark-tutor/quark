"use client";

import { Fragment, useState, type FormEvent, type ReactNode } from "react";
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

// Brandon's pictures that are in (Documents/quark-art, README.txt; put in on 16 Nov 2026 at stop 2), in public/boat as
// WebP at 1344 x 896: market-stilts on the first screen and the harbor market, market-hillside on the village market,
// cast-off on the cast-off and "Done for today", landing on the landing. Any other stays a placeholder. They show the
// scene only: nothing in them is counted (the crates and bills are drawn), and they carry no words.
const DRAWN = new Set(["market-stilts", "market-hillside", "cast-off", "landing"]);

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
  const read = <ReadAloud key={`read:${s.speak}`} line={`boat.screen.${tag(s.speak)}`} small={!!s.trade} />;
  // On a trade, "Choose again" and the like are small, beside "Read it to me", unless the count has ended, when the
  // way on is the thing to press.
  const quiet = !!s.trade && !s.trade.ended;
  const buttons = s.buttons.length ? (
    <div className={styles.boatButtons}>
      {s.buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          className={quiet ? styles.boatSmall : b.action.type === "next" || b.action.type === "sail" || b.action.type === "fewer" ? styles.send : styles.play}
          disabled={busy}
          onClick={() => void send(b.action)}
        >
          {b.label}
        </button>
      ))}
    </div>
  ) : null;
  // What opens in a row (at a market, under the good chosen; at the landing, under the buyer): "how many?" with its
  // buttons, or the trade. The place, the money and the boat stay above it (stop 2, 16 Nov 2026).
  const panel = s.trade ? (
    <TradeBox key={`trade:${s.speak}`} screen={s} busy={busy} read={read} actions={buttons} onAnswer={(text) => send({ type: "answer", text })} />
  ) : s.stepper ? (
    <>
      <Stepper key={`stepper:${s.speak}`} ask={s.stepper.ask} max={s.stepper.max} maxLine={s.stepper.maxLine} busy={busy} onPick={(n) => void send({ type: "count", n })} />
      {buttons}
    </>
  ) : null;
  return (
    <div className={styles.boat}>
      {s.picture && DRAWN.has(s.picture) ? (
        // eslint-disable-next-line @next/next/no-img-element -- a fixed scene in public/boat, already sized for the iPad
        <img className={styles.scene} src={`/boat/${s.picture}.webp`} alt="" width={1344} height={896} />
      ) : s.picture ? (
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
        {s.trade ? null : read}
        {s.offers ? (
          <div className={styles.offerList}>
            {s.offers.map((o) => {
              const here = s.open?.offer === o.offer;
              return (
                <Fragment key={o.offer}>
                  <button
                    type="button"
                    className={here ? `${styles.offerRow} ${styles.offerHere}` : styles.offerRow}
                    disabled={here || !o.open || busy}
                    onClick={() => void send({ type: "pick", market: o.market, offer: o.offer })}
                  >
                    <span>{o.label}</span>
                    <span className={styles.muted}>{o.left}</span>
                  </button>
                  {here && panel ? <div className={styles.rowPanel}>{panel}</div> : null}
                </Fragment>
              );
            })}
          </div>
        ) : panel ? (
          <div className={styles.rowPanel}>{panel}</div>
        ) : null}
        {panel ? null : buttons}
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

// A trade, top to bottom: the crates, centred; the question with its sum beside it; what the tutor says back and the
// count's step; "Read it to me" and "Choose again", small; then one narrow column to answer in: the box, the number pad
// (three keys across, as on a phone), "That's my answer" under it, and Talk.
function TradeBox({ screen, busy, read, actions, onAnswer }: { screen: Screen; busy: boolean; read: ReactNode; actions: ReactNode; onAnswer: (text: string) => Promise<boolean> }) {
  const t = screen.trade!;
  const [guess, setGuess] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim() || busy) return;
    if (await onAnswer(guess)) setGuess("");
  }
  return (
    <div className={styles.trade}>
      {t.pic ? <Crates pic={t.pic} now={t.step?.k ?? null} /> : null}
      {t.lines.map((line) => (
        <p key={line} className={styles.cardText}>
          {line}
        </p>
      ))}
      {/* One question at a time (Brandon at stop 2, 16 Nov 2026: "Do I answer the top one or the bottom?"). During the
          count the trade's sum stays as a quiet reminder, with no question mark, and the step is the only question
          beside the box. */}
      {t.step || t.ended ? (
        <p className={styles.sumGoal}>{t.sum.replace(/\s*=\s*\?$/, "")}</p>
      ) : (
        <div className={styles.tradeAsk}>
          <p className={styles.question}>{t.question}</p>
          <p className={styles.sumLine}>{t.sum}</p>
        </div>
      )}
      {t.reply ? <p className={styles.reply}>{t.reply}</p> : null}
      {t.step ? (
        <div className={styles.tradeAsk}>
          <p className={styles.question}>{t.step.ask}</p>
          <p className={styles.sumLine}>{t.step.sum}</p>
        </div>
      ) : null}
      {t.ended ? t.ended.map((line) => <p key={line} className={styles.reply}>{line}</p>) : null}
      <div className={styles.tradeTools}>
        {read}
        {actions}
      </div>
      {t.answering ? (
        <form className={styles.boatAnswer} onSubmit={submit}>
          <input
            className={styles.boatBox}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={SAY.typeHere}
            aria-label={SAY.typeHere}
            maxLength={200}
            enterKeyHint="send"
            autoComplete="off"
          />
          <NumberPad disabled={busy} onChange={(edit) => setGuess((g) => edit(g))} />
          <button type="submit" className={styles.send} disabled={!guess.trim() || busy}>
            {SAY.send}
          </button>
          <Talk disabled={busy} onHeard={(words) => setGuess((g) => (g.trim() ? `${g.trim()} ${words}` : words).slice(0, 200))} />
        </form>
      ) : null}
    </div>
  );
}
