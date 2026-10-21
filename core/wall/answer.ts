import { isMeaningful, words } from "../curation/cards.ts";
import type { AnswerKey } from "../curation/types.ts";

// Is a child's guess right? Judged in code, with no model call (docs/wonder-wall-1-slice.md, decision 2):
// the hint check's word rule (words() in core/curation/cards.ts), with these additions:
//   - a one-letter slip is forgiven in a word of five letters or more ("chello" is "cello");
//   - a guess with "not", "no", "never" or "n't" is not right unless the answer it matches has one too;
//   - on a question that offers a choice of two, a guess that also holds the other choice is not right
//     ("north or south" is not "north"; Brandon, 20 Oct 2026), and a yes-or-no question offers yes and no;
//   - the iPad's curly apostrophe, "yeah" and "nope", and digits read the same as their plain words
//     (decided at step 1, 21 Oct 2026: they fixed 7 of 105 right answers and broke none).
// The rule is "every" (the guess holds every meaningful word of some accepted answer, as often as the
// answer uses it) or "any" (it holds any one of them); both keep the not and choice guards. The wall runs
// "every" until Brandon chooses at the iPad stop.
// It misjudges often: at step 1, two in three right answers in a child's own words (the table is in the
// slice's report), so the reply to a guess that isn't judged right never says it was wrong.

export type MatchRule = "every" | "any";
export type Judged = "right" | "not_yet" | "open" | "not_a_guess";

const SAME: Record<string, string> = {
  yeah: "yes",
  yep: "yes",
  yup: "yes",
  nope: "no",
  nah: "no",
  0: "zero",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
  13: "thirteen",
  14: "fourteen",
  15: "fifteen",
  16: "sixteen",
  17: "seventeen",
  18: "eighteen",
  19: "nineteen",
  20: "twenty",
  100: "hundred",
};
const NEGATIONS = new Set(["not", "no", "never"]);
const NOT_A_GUESS = new Set(["i don't know", "i dont know", "idk", "dunno", "i dunno", "no idea", "i have no idea", "not sure", "i'm not sure", "im not sure"]);

const plain = (s: string) => s.replace(/[’‘]/g, "'");
// "didn't" holds "not": n't is read as not, on both sides.
const tokens = (s: string) => words(plain(s).replace(/n't\b/gi, " not")).map((w) => SAME[w] ?? w);
const meaningful = (s: string) => tokens(s).filter(isMeaningful);

// A blank, a guess with no letter or digit, or "I don't know" is not a guess: no hint follows it (docs/12).
export function isGuess(guess: string): boolean {
  const g = plain(guess).trim().toLowerCase().replace(/[.!?]+$/, "").trim();
  return /[a-z0-9]/.test(g) && !NOT_A_GUESS.has(g);
}

// One letter added, dropped or changed, or two side by side swapped, in a word of five letters or more.
export function slip(typed: string, want: string): boolean {
  if (typed === want) return true;
  if (want.length < 5 || /\d/.test(typed + want) || Math.abs(typed.length - want.length) > 1) return false;
  if (typed.length === want.length) {
    const diff = [...typed].flatMap((c, i) => (c === want[i] ? [] : [i]));
    if (diff.length === 1) return true;
    return diff.length === 2 && diff[1] === diff[0] + 1 && typed[diff[0]] === want[diff[1]] && typed[diff[1]] === want[diff[0]];
  }
  const [short, long] = typed.length < want.length ? [typed, want] : [want, typed];
  for (let i = 0; i < long.length; i++) if (long.slice(0, i) + long.slice(i + 1) === short) return true;
  return false;
}

// How many of the answer's meaningful words the guess holds, each guess word used once, and how many it needs.
function overlap(guess: string[], answer: string): { held: number; need: number } {
  const need = meaningful(answer);
  const pool = [...guess];
  let held = 0;
  for (const w of need) {
    let i = pool.indexOf(w);
    if (i < 0) i = pool.findIndex((g) => slip(g, w));
    if (i < 0) continue;
    pool.splice(i, 1);
    held += 1;
  }
  return { held, need: need.length };
}

export type Choices = { right: string[]; other: string[] };

// The two choices a question offers, or null. With "…X or Y?", the accepted answers whose words all sit on
// one side of the last "or" mark that side as right, and the other choice is as many meaningful words on the
// far side, next to the "or", less the words the right side already uses between the "or" and its answer
// ("a place near the equator or a place near the North Pole": the other choice is "equator"). A question
// whose first accepted answer starts with yes or no offers yes and no. A choice named without "or" ("which of
// the two islands…") is not found.
export function choicesOf(question: string, accept: string[]): Choices | null {
  const all = tokens(question);
  const at = all.lastIndexOf("or");
  if (at >= 0) {
    const before = all.slice(0, at).filter(isMeaningful);
    const after = all.slice(at + 1).filter(isMeaningful);
    for (const [side, far, rightIsAfter] of [
      [after, before, true],
      [before, after, false],
    ] as const) {
      let best: { span: number; words: string[]; near: string[] } | null = null;
      for (const a of accept) {
        const need = meaningful(a);
        if (!need.length || !need.every((w) => side.includes(w))) continue;
        // The hit nearest the "or" on its side.
        const idx = need.map((w) => (rightIsAfter ? side.indexOf(w) : side.lastIndexOf(w)));
        const span = Math.max(...idx) - Math.min(...idx) + 1;
        const near = rightIsAfter ? side.slice(0, Math.max(...idx) + 1) : side.slice(Math.min(...idx));
        if (!best || span > best.span) best = { span, words: need, near };
      }
      if (!best) continue;
      const window = rightIsAfter ? far.slice(-best.span) : far.slice(0, best.span);
      const other = window.filter((w) => !best.near.includes(w));
      if (other.length) return { right: best.words, other };
    }
  }
  const first = meaningful(accept[0] ?? "")[0];
  if (first === "yes") return { right: ["yes"], other: ["no"] };
  if (first === "no") return { right: ["no"], other: ["yes"] };
  return null;
}

export function judgeGuess(guess: string, key: AnswerKey, question: string, rule: MatchRule = "every"): Judged {
  if (!isGuess(guess)) return "not_a_guess";
  if (!key.accept.length) return "open"; // no accepted answers: any real guess is taken, and the handoff follows
  const g = tokens(guess);
  const negated = g.some((w) => NEGATIONS.has(w));
  const two = choicesOf(question, key.accept);
  const right = key.accept.some((answer) => {
    const { held, need } = overlap(g, answer);
    if (need === 0 || (rule === "every" ? held < need : held === 0)) return false;
    const a = tokens(answer);
    if (negated && !a.some((w) => NEGATIONS.has(w))) return false;
    if (two && two.other.some((o) => g.includes(o) && !a.includes(o))) return false;
    return true;
  });
  return right ? "right" : "not_yet";
}
