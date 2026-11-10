// A math problem (docs/math-tile-slice.md, What is built 3): what the Sunday build asks the model for, what code
// checks (checkMath() in check.ts), and what each part's card carries on the wall. Every word a child reads or hears
// is here, written on Sunday and passed by the gate; the wall adds only its own fixed sentences (core/wall/words.ts).

export type MathStep = { question: string; answer: number; expression: string };

export type MathPart = {
  question: string;
  answer: number; // a whole number, worked out from expression by the program
  unit: string; // "cups", "dollars", "minutes"
  expression: string; // the sum itself: "236 + 148", "7 × (2 + 1)"
  wordings: string[]; // two other ways of asking the same question
  steps: MathStep[]; // two to four, one at a time; the last step's answer is the part's
  tie: string; // something he knows: "It's like counting chair legs: every chair has 4."
  working: string[]; // two lines, shown after a right answer: the sum, then in words
};

// A picture drawn by the program from its numbers (decided at stop 1: no library picture for math in this slice).
//   groups: numbers [how many groups, how many in each], labels [what a group is, what is in it]
//   blocks: numbers [the numbers being added], as hundreds, tens and ones
//   clock:  numbers [minutes shaded of the hour]
//   graph:  numbers [each bar], labels [each bar's name]
export const PICTURE_KINDS = ["groups", "blocks", "clock", "graph", "none"] as const;
export type PictureKind = (typeof PICTURE_KINDS)[number];
export type Picture = { kind: PictureKind; numbers: number[]; labels: string[] };
export const NO_PICTURE: Picture = { kind: "none", numbers: [], labels: [] };

export type WorkedExample = { text: string; working: string[]; expression: string; picture: Picture };

export type MathProblem = {
  title: string;
  setting: string; // two or three sentences
  graph: Picture; // a bar graph of the setting's own numbers, or none
  parts: MathPart[]; // four
  example: WorkedExample | null; // only when the rung or area is new to him
  handoff: string; // the line after "This one is for a person:"
};

// How a boy's problems are written (children.math_style; decided 9 Nov 2026, Each boy at his own pace).
//   short:  four short sums, one operation each, each part needed for the fourth.
//   hidden: words that hide the sum; parts 1 and 2 feed part 3, which asks "How do you know?" after his right
//           answer; part 4 is a quick one, on its own, because he likes them.
export type MathStyle = "short" | "hidden";
export const MATH_STYLES: readonly MathStyle[] = ["short", "hidden"];
export const PARTS = 4;
export const goalOf = (style: MathStyle) => (style === "hidden" ? 3 : 4);
export const quickOf = (style: MathStyle) => (style === "hidden" ? 4 : null);
export const whyOf = (style: MathStyle) => (style === "hidden" ? 3 : null);

// One boy's day in the Math tile, planned by code before anything is written (planMath() in core/curation/math.ts).
export type MathDay = {
  day: number;
  teaches: string; // a rung's key, or an everyday area's
  everyday: boolean;
  isNew: boolean; // he has not met it: the worked example comes first
  style: MathStyle;
  setting?: string | null; // where today's problem is set: one of the family's places and things, or one of his interests
};

// What each part's card carries in its body, beside title, text (the setting), question and handoff.
export type MathCard = MathPart & {
  part: number; // 1 to 4
  of: number; // 4
  goal: number; // the part the others build toward
  teaches: string;
  everyday: boolean;
  why: boolean; // "How do you know?" after his right answer
  quick: boolean;
  graph: Picture;
  example?: WorkedExample; // part 1 only, when new
};
