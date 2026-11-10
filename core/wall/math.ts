import type { MathCard } from "../math/problem.ts";
import type { AttemptRow, ChainLayer, CardState } from "./card.ts";

// The Math tile on the wall (docs/math-tile-slice.md, What is built 6 and 7): where a boy is in a problem, worked out
// from his attempts alone, as a card's layers are, and what the page shows. A part is a layer; the tutor's moves take
// the place of hints, in a fixed order (the label on what he said does not choose them in this slice):
//   the question → wrong → "How did you get that?" (whatever he says is kept) → "Here it is another way:" the first
//   other wording → wrong → "One step at a time:" the steps, one by one, a right step bringing the next, the last
//   step's answer being the part's → a wrong step → "Think of it like this:" the tie, and the second other wording →
//   wrong → "This one is for a person:".
// A right answer anywhere: "That's it.", and on the younger boy's why part "How do you know?" first, then "Here's the
// whole thing:" with the working, and the next part. Every word is the problem's own, written on Sunday and passed
// by the gate, or one of the wall's own sentences in words.ts; the tutor never says the answer (rule 3). Pure.

export type Move = "question" | "how" | "wording_1" | "step_1" | "step_2" | "step_3" | "step_4" | "wording_2" | "why";
export const NUMBER_MOVES: readonly Move[] = ["question", "wording_1", "step_1", "step_2", "step_3", "step_4", "wording_2"];
const step = (k: number) => `step_${k}` as Move;
export const stepOf = (m: Move) => (m.startsWith("step_") ? Number(m.slice(5)) : 0);

// Where a boy is in one part. stepsShown counts the steps the page has put in front of him; tie is the tie and the
// second wording; ended is right (the part done) or handed_off (the problem ends at a person).
export type PartRun = { move: Move | "right" | "handed_off"; howAsked: boolean; wording1: boolean; stepsShown: number; tie: boolean; whyAsked: boolean };
const FRESH: PartRun = { move: "question", howAsked: false, wording1: false, stepsShown: 0, tie: false, whyAsked: false };

// One part's attempts, oldest first, replayed through the moves. An attempt past the end is ignored.
export function runPart(m: MathCard, attempts: AttemptRow[]): PartRun {
  const run: PartRun = { ...FRESH };
  const after = (right: boolean) => {
    if (!right) return;
    run.move = m.why ? "why" : "right";
    if (m.why) run.whyAsked = true;
  };
  for (const a of attempts) {
    const move = run.move;
    if (move === "right" || move === "handed_off") break;
    if (move === "question") {
      if (a.correct) after(true);
      else {
        run.move = "how";
        run.howAsked = true;
      }
    } else if (move === "how") {
      run.move = "wording_1";
      run.wording1 = true;
    } else if (move === "wording_1") {
      if (a.correct) after(true);
      else {
        run.move = step(1);
        run.stepsShown = 1;
      }
    } else if (move.startsWith("step_")) {
      const k = stepOf(move);
      if (a.correct && k < m.steps.length) {
        run.move = step(k + 1);
        run.stepsShown = k + 1;
      } else if (a.correct) after(true);
      else {
        run.move = "wording_2";
        run.tie = true;
      }
    } else if (move === "wording_2") {
      if (a.correct) after(true);
      else run.move = "handed_off";
    } else if (move === "why") run.move = "right";
  }
  return run;
}

// The number a move asks for, or null for a move he answers in his own words.
export function expected(m: MathCard, move: Move): number | null {
  if (move === "how" || move === "why") return null;
  const k = stepOf(move);
  return k ? m.steps[k - 1]?.answer ?? null : m.answer;
}

export const isMath = (chain: ChainLayer[]) => chain.length > 0 && !!chain[0].body.math;

// The problem's state as the wall's other cards have it: the part he is at, done after the last part's right answer
// or at a person, and that part's run.
export type MathState = CardState & { run: PartRun };

export function mathState(chain: ChainLayer[], attempts: AttemptRow[]): MathState {
  const ordered = [...attempts].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (let at = 0; at < chain.length; at++) {
    const m = chain[at].body.math!;
    const run = runPart(m, ordered.filter((a) => a.question_id === chain[at].questionId));
    if (run.move === "handed_off") return { kind: "handed_off", at, hintsSeen: 0, run };
    if (run.move !== "right") return { kind: "answering", at, hintsSeen: 0, run };
    if (at === chain.length - 1) return { kind: "answered", at, hintsSeen: 0, run };
  }
  return { kind: "answering", at: 0, hintsSeen: 0, run: { ...FRESH } };
}

// --- What the page shows (rule 7: these fields and nothing else) ---

// A line of the conversation under the question: one of the wall's sentences (say), the problem's own words (text),
// or both; line names it for "Read it to me".
export type MathSay = "howGotThat" | "anotherWay" | "oneStep" | "thinkOfIt" | "right" | "howDoYouKnow" | "wholeThing";
export type MathLine = { say: MathSay | null; text: string | null; line: string | null };

export type MathView = {
  lines: MathLine[]; // the moves so far, in order
  asking: "number" | "words" | null; // what the box takes now; null when the part is finished
  prompt: MathLine | null; // what the box answers now, shown just above it
  working: string[] | null; // after a right answer, with "Here's the whole thing:"
  next: string | null; // the next part's card id, once earned
  handoff: string | null; // once the problem is done or at a person
  handedOff: boolean;
};

export const mathLineId = (cardId: string, part: "wording" | "step", n: number) => `${cardId}.${part}.${n}`;

// The page for the part the chain state is at.
export function mathView(chain: ChainLayer[], state: MathState): MathView {
  const { cardId, body } = chain[state.at];
  const m = body.math!;
  const run = state.run;
  const lines: MathLine[] = [];
  const say = (s: MathSay, text: string | null = null, line: string | null = null) => lines.push({ say: s, text, line });
  if (run.howAsked && run.move !== "how") say("howGotThat");
  if (run.wording1) say("anotherWay", m.wordings[0], mathLineId(cardId, "wording", 1));
  for (let k = 1; k <= run.stepsShown; k++) {
    if (k === 1) say("oneStep", m.steps[0].question, mathLineId(cardId, "step", 1));
    else {
      say("right");
      lines.push({ say: null, text: m.steps[k - 1].question, line: mathLineId(cardId, "step", k) });
    }
  }
  if (run.tie) {
    say("thinkOfIt", m.tie, `${cardId}.tie`);
    say("anotherWay", m.wordings[1], mathLineId(cardId, "wording", 2));
  }
  const view: MathView = { lines, asking: null, prompt: null, working: null, next: null, handoff: null, handedOff: false };
  const move = run.move;
  if (move === "handed_off") return { ...view, handoff: body.handoff, handedOff: true };
  if (move === "right") {
    const last = state.at === chain.length - 1;
    if (run.whyAsked) say("howDoYouKnow");
    return { ...view, working: m.working, next: last ? null : chain[state.at + 1].cardId, handoff: last ? body.handoff : null };
  }
  if (move === "why") {
    say("right");
    return { ...view, asking: "words", prompt: { say: "howDoYouKnow", text: null, line: "wall.howDoYouKnow" } };
  }
  if (move === "how") return { ...view, asking: "words", prompt: { say: "howGotThat", text: null, line: "wall.howGotThat" } };
  const k = stepOf(move);
  const prompt: MathLine =
    move === "question"
      ? { say: null, text: body.question, line: `${cardId}.question` }
      : move === "wording_1"
        ? { say: null, text: m.wordings[0], line: mathLineId(cardId, "wording", 1) }
        : move === "wording_2"
          ? { say: null, text: m.wordings[1], line: mathLineId(cardId, "wording", 2) }
          : { say: null, text: m.steps[k - 1].question, line: mathLineId(cardId, "step", k) };
  return { ...view, asking: "number", prompt };
}

// Whether a line of a math card may be said now (rule 3): a wording, step or tie once the moves have shown it, the
// working once he has the part right, the worked example on the first part. Lines of a part he has finished stay.
export type MathPartLine = { kind: "wording" | "step"; n: number } | { kind: "tie" | "working" | "example" };
export function mathLineSeen(m: MathCard, run: PartRun, part: MathPartLine): boolean {
  if (part.kind === "example") return !!m.example;
  if (part.kind === "wording") return part.n === 1 ? run.wording1 : run.tie;
  if (part.kind === "step") return part.n <= run.stepsShown;
  if (part.kind === "tie") return run.tie;
  return run.move === "right";
}
