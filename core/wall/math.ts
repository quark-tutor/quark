import type { MathCard } from "../math/problem.ts";
import { sumLine } from "../math/expr.ts";
import type { AttemptRow, ChainLayer, CardState } from "./card.ts";

// The Math tile on the wall (docs/math-tile-slice.md, What is built 6 and 7): where a boy is in a problem, worked out
// from his attempts alone, as a card's layers are, and what the page shows. A part is a layer; the tutor's moves take
// the place of hints, in a fixed order (the label on what he said does not choose them in this slice):
//   the question → wrong → "How did you get that?" (whatever he says is kept) → "Here it is another way:" the first
//   other wording → wrong → "One step at a time:" the steps, one by one, a right step bringing the next, the last
//   step's answer being the part's → a wrong step → "Think of it like this:" the tie, and the second other wording →
//   wrong → "This one is for a person:".
// A right answer anywhere: "That's it.", and on the younger boy's why part "How do you know?" first, then "Here's the
// whole thing:" with the working, and the next part.
// A reply with no number is read by the judge first (core/wall/no-number.ts; Brandon, 9 Nov 2026, fix round 2):
//   he questioned the problem → "Good catch. Thank you for telling me." and "Here it is another way:" with the next
//     wording; questioned again → "This one is for a person:". Neither costs him anything;
//   anything else → "What number do you get?"; a second one on the same move → "Here it is another way:" with the
//     next wording, and a person when none is left. He is never looped.
// Every word is the problem's own, written on Sunday and passed by the gate, or one of the wall's own sentences in
// words.ts; the tutor never says the answer (rule 3). Pure.

export type Move = "question" | "how" | "wording_1" | "step_1" | "step_2" | "step_3" | "step_4" | "wording_2" | "why";
export const NUMBER_MOVES: readonly Move[] = ["question", "wording_1", "step_1", "step_2", "step_3", "step_4", "wording_2"];
const step = (k: number) => `step_${k}` as Move;
export const stepOf = (m: Move) => (m.startsWith("step_") ? Number(m.slice(5)) : 0);

// The wall's own sentences a math part says (core/wall/words.ts).
export type MathSay = "howGotThat" | "anotherWay" | "oneStep" | "thinkOfIt" | "right" | "howDoYouKnow" | "wholeThing" | "goodCatch" | "whatNumber";

// One thing the page has put in front of him, in order: a sentence of the wall's, a piece of the problem, or both.
export type MathEvent = { say: MathSay | null; piece: { wording: 1 | 2 } | { step: number } | "tie" | null };

// Where a boy is in one part: the move the box answers now, or right (the part done) or handed_off (the problem ends
// at a person), and everything shown so far. stepsShown counts the steps put in front of him; wording1 and wording2
// the other wordings; tie the tie; questioned how often he said the problem was wrong; noNumber his replies with no
// number on the move he is at.
export type PartRun = {
  move: Move | "right" | "handed_off";
  events: MathEvent[];
  wording1: boolean;
  wording2: boolean;
  stepsShown: number;
  tie: boolean;
  whyAsked: boolean;
  questioned: number;
  noNumber: number;
};
const fresh = (): PartRun => ({ move: "question", events: [], wording1: false, wording2: false, stepsShown: 0, tie: false, whyAsked: false, questioned: 0, noNumber: 0 });

// One part's attempts, oldest first, replayed through the moves. An attempt past the end is ignored.
export function runPart(m: MathCard, attempts: AttemptRow[]): PartRun {
  const run = fresh();
  const show = (say: MathSay | null, piece: MathEvent["piece"] = null) => run.events.push({ say, piece });
  const go = (move: PartRun["move"]) => {
    if (move !== run.move) run.noNumber = 0;
    run.move = move;
  };
  const right = () => {
    if (m.why) {
      show("right");
      run.whyAsked = true;
      go("why");
    } else go("right");
  };
  // The next other wording he has not seen, or a person when both are shown.
  const nextWording = () => {
    if (!run.wording1) {
      run.wording1 = true;
      show("anotherWay", { wording: 1 });
      go("wording_1");
    } else if (!run.wording2) {
      run.wording2 = true;
      show("anotherWay", { wording: 2 });
      go("wording_2");
    } else go("handed_off");
  };
  for (const a of attempts) {
    const move = run.move;
    if (move === "right" || move === "handed_off") break;
    if (a.verdict === "questioned") {
      run.questioned += 1;
      show("goodCatch");
      if (run.questioned >= 2) go("handed_off");
      else nextWording();
      continue;
    }
    if (a.verdict === "no_number") {
      run.noNumber += 1;
      if (run.noNumber === 1) show("whatNumber");
      else nextWording();
      continue;
    }
    if (move === "question") {
      if (a.correct) right();
      else go("how");
    } else if (move === "how") {
      show("howGotThat");
      run.wording1 = true;
      show("anotherWay", { wording: 1 });
      go("wording_1");
    } else if (move === "wording_1") {
      if (a.correct) right();
      else {
        run.stepsShown = 1;
        show("oneStep", { step: 1 });
        go(step(1));
      }
    } else if (move.startsWith("step_")) {
      const k = stepOf(move);
      if (a.correct && k < m.steps.length) {
        run.stepsShown = k + 1;
        show("right");
        show(null, { step: k + 1 });
        go(step(k + 1));
      } else if (a.correct) right();
      else {
        run.tie = true;
        run.wording2 = true;
        show("thinkOfIt", "tie");
        show("anotherWay", { wording: 2 });
        go("wording_2");
      }
    } else if (move === "wording_2") {
      if (a.correct) right();
      else go("handed_off");
    } else if (move === "why") {
      show("howDoYouKnow");
      go("right");
    }
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
  return { kind: "answering", at: 0, hintsSeen: 0, run: fresh() };
}

// --- What the page shows (rule 7: these fields and nothing else) ---

// A line of the conversation under the question: one of the wall's sentences (say), the problem's own words (text),
// or both; line names it for "Read it to me".
// sum: a step's sum, written out by the program from its expression ("300 + 70 = ?"; fix round 4).
export type MathLine = { say: MathSay | null; text: string | null; line: string | null; sum?: string | null };

export type MathView = {
  partSum: string | null; // the part's sum, under its question from the start: "120 + 250 = ?" (fix round 4)
  lines: MathLine[]; // the moves so far, in order
  asking: "number" | "words" | null; // what the box takes now; null when the part is finished
  prompt: MathLine | null; // what the box answers now, shown just above it
  working: string[] | null; // after a right answer, with "Here's the whole thing:"
  rightSaid: boolean; // "That's it." is already in the lines (the why part), so the ending does not say it again
  next: string | null; // the next part's card id, once earned
  handoff: string | null; // once the problem is done or at a person
  handedOff: boolean;
};

export const mathLineId = (cardId: string, part: "wording" | "step", n: number) => `${cardId}.${part}.${n}`;

// The words, the line name, and for a step its sum, of a piece of the problem.
function pieceOf(cardId: string, m: MathCard, piece: MathEvent["piece"]): { text: string; line: string; sum: string | null } | null {
  if (piece === null) return null;
  if (piece === "tie") return { text: m.tie, line: `${cardId}.tie`, sum: null };
  if ("wording" in piece) return { text: m.wordings[piece.wording - 1], line: mathLineId(cardId, "wording", piece.wording), sum: null };
  const s = m.steps[piece.step - 1];
  return { text: s.question, line: mathLineId(cardId, "step", piece.step), sum: sumLine(s.expression) };
}

// The page for the part the chain state is at.
export function mathView(chain: ChainLayer[], state: MathState): MathView {
  const { cardId, body } = chain[state.at];
  const m = body.math!;
  const run = state.run;
  const lines: MathLine[] = run.events.map((e) => {
    const p = pieceOf(cardId, m, e.piece);
    return { say: e.say, text: p?.text ?? null, line: p?.line ?? null, ...(p?.sum ? { sum: p.sum } : {}) };
  });
  const view: MathView = { partSum: sumLine(m.expression), lines, asking: null, prompt: null, working: null, rightSaid: false, next: null, handoff: null, handedOff: false };
  const move = run.move;
  if (move === "handed_off") return { ...view, handoff: body.handoff, handedOff: true };
  if (move === "right") {
    const last = state.at === chain.length - 1;
    return { ...view, working: m.working, rightSaid: run.whyAsked, next: last ? null : chain[state.at + 1].cardId, handoff: last ? body.handoff : null };
  }
  if (move === "why") return { ...view, asking: "words", prompt: { say: "howDoYouKnow", text: null, line: "wall.howDoYouKnow" } };
  if (move === "how") return { ...view, asking: "words", prompt: { say: "howGotThat", text: null, line: "wall.howGotThat" } };
  const k = stepOf(move);
  const prompt: MathLine =
    move === "question"
      ? { say: null, text: body.question, line: `${cardId}.question` }
      : move === "wording_1"
        ? { say: null, text: m.wordings[0], line: mathLineId(cardId, "wording", 1) }
        : move === "wording_2"
          ? { say: null, text: m.wordings[1], line: mathLineId(cardId, "wording", 2) }
          : { say: null, text: m.steps[k - 1].question, line: mathLineId(cardId, "step", k), sum: sumLine(m.steps[k - 1].expression) };
  return { ...view, asking: "number", prompt };
}

// Whether a line of a math card may be said now (rule 3): a wording, step or tie once the moves have shown it, the
// working once he has the part right, the worked example on the first part. Lines of a part he has finished stay.
export type MathPartLine = { kind: "wording" | "step"; n: number } | { kind: "tie" | "working" | "example" };
export function mathLineSeen(m: MathCard, run: PartRun, part: MathPartLine): boolean {
  if (part.kind === "example") return !!m.example;
  if (part.kind === "wording") return part.n === 1 ? run.wording1 : run.wording2;
  if (part.kind === "step") return part.n <= run.stepsShown;
  if (part.kind === "tie") return run.tie;
  return run.move === "right";
}
