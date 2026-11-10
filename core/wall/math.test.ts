import { describe, expect, it } from "vitest";
import { mathCards } from "../curation/math";
import { CONES, MARKET } from "../math/samples";
import type { MathDay } from "../math/problem";
import type { AttemptRow, ChainLayer } from "./card";
import { expected, mathLineSeen, mathState, mathView, runPart } from "./math";

// The moves on a math part (docs/math-tile-slice.md, stop 2's checks 1 to 5), from the attempts alone.
const day = (style: "short" | "hidden"): MathDay => ({ day: 1, teaches: "money", everyday: true, isNew: false, style });
const chainOf = (p: typeof MARKET, style: "short" | "hidden"): ChainLayer[] =>
  mathCards(p, day(style)).map((body, i) => ({ cardId: `c${i + 1}`, slot: "puzzle", layer: i + 1, body, questionId: `q${i + 1}`, answerKey: { accept: [String(body.math!.answer)], rubric: "" } }));
let clock = 0;
const said = (q: string, correct: boolean | null): AttemptRow => ({ question_id: q, correct, created_at: new Date(Date.UTC(2026, 10, 10, 0, 0, clock++)).toISOString() });

describe("a math part's moves", () => {
  const market = chainOf(MARKET, "short");
  const m = market[0].body.math!;

  it("shows the part's sum, and each step's, written out by the program from the start (fix round 4)", () => {
    expect(mathView(market, mathState(market, [])).partSum).toBe("3 × 2 = ?");
    const steps = mathView(market, mathState(market, [said("q1", false), said("q1", null), said("q1", false)]));
    expect(steps.prompt).toMatchObject({ text: m.steps[0].question, sum: "2 × 2 = ?" });
    expect(steps.lines.at(-1)).toMatchObject({ say: "oneStep", sum: "2 × 2 = ?" });
  });

  it("check 1: a right first answer gives the working and the next part", () => {
    const v = mathView(market, { ...mathState(market, []), run: runPart(m, [said("q1", true)]) });
    expect(v).toMatchObject({ asking: null, working: ["3 × $2 = $6.", "The bananas cost $6."], next: "c2", handoff: null });
    expect(mathState(market, [said("q1", true)]).at).toBe(1);
  });

  it("check 2: a wrong answer asks how, with no clue; his how brings the question another way", () => {
    const wrong = [said("q1", false)];
    expect(mathView(market, mathState(market, wrong))).toMatchObject({ lines: [], asking: "words", prompt: { say: "howGotThat" } });
    const v = mathView(market, mathState(market, [...wrong, said("q1", null)]));
    expect(v.lines).toEqual([{ say: "howGotThat", text: null, line: null }, { say: "anotherWay", text: m.wordings[0], line: "c1.wording.1" }]);
    expect(v).toMatchObject({ asking: "number", prompt: { text: m.wordings[0] } });
    expect(expected(m, "wording_1")).toBe(6);
  });

  it("check 3: wrong again gives one small step, and a right step the next", () => {
    const base = [said("q1", false), said("q1", null), said("q1", false)];
    expect(mathView(market, mathState(market, base))).toMatchObject({ asking: "number", prompt: { text: m.steps[0].question } });
    expect(expected(m, "step_1")).toBe(4);
    const v = mathView(market, mathState(market, [...base, said("q1", true)]));
    expect(v.lines.slice(-2)).toEqual([{ say: "right", text: null, line: null }, { say: null, text: m.steps[1].question, line: "c1.step.2", sum: "4 + 2 = ?" }]);
    // The last step's answer is the part's: right there, and the part is done.
    expect(mathState(market, [...base, said("q1", true), said("q1", true)]).at).toBe(1);
  });

  it("check 4: a wrong step brings the tie and the third wording, and wrong again ends at a person", () => {
    const base = [said("q1", false), said("q1", null), said("q1", false), said("q1", false)];
    const v = mathView(market, mathState(market, base));
    expect(v.lines.slice(-2)).toEqual([
      { say: "thinkOfIt", text: m.tie, line: "c1.tie" },
      { say: "anotherWay", text: m.wordings[1], line: "c1.wording.2" },
    ]);
    const end = mathState(market, [...base, said("q1", false)]);
    expect(end.kind).toBe("handed_off");
    expect(mathView(market, end)).toMatchObject({ asking: null, handedOff: true, handoff: MARKET.handoff, working: null });
  });

  it("asks the younger boy how he knows after his right answer on part 3, then shows the working", () => {
    const cones = chainOf(CONES, "hidden");
    const before = [said("q1", true), said("q2", true), said("q3", true)];
    expect(mathView(cones, mathState(cones, before))).toMatchObject({ asking: "words", prompt: { say: "howDoYouKnow" } });
    const after = mathState(cones, [...before, said("q3", null)]);
    expect(after.at).toBe(3);
    expect(mathView(cones, { ...after, at: 2, run: runPart(cones[2].body.math!, [said("q3", true), said("q3", null)]) })).toMatchObject({ working: CONES.parts[2].working, next: "c4" });
  });

  it("says a move's words only once the moves have shown them, and the working only after a right answer (rule 3)", () => {
    const run = runPart(m, [said("q1", false), said("q1", null)]);
    expect(mathLineSeen(m, run, { kind: "wording", n: 1 })).toBe(true);
    expect(mathLineSeen(m, run, { kind: "wording", n: 2 })).toBe(false);
    expect(mathLineSeen(m, run, { kind: "step", n: 1 })).toBe(false);
    expect(mathLineSeen(m, run, { kind: "working" })).toBe(false);
    expect(mathLineSeen(m, runPart(m, [said("q1", true)]), { kind: "working" })).toBe(true);
  });
});

// A reply with no number, read by the judge first (Brandon, 9 Nov 2026, fix round 2).
const flagged = (q: string, verdict: "questioned" | "no_number"): AttemptRow => ({ question_id: q, correct: null, verdict, created_at: new Date(Date.UTC(2026, 10, 10, 0, 0, clock++)).toISOString() });

describe("a math reply with no number", () => {
  const market = chainOf(MARKET, "short");
  const m = market[0].body.math!;

  it("he questioned the problem: \"Good catch.\" and the other wording, at no cost; questioned again, a person", () => {
    const once = mathView(market, mathState(market, [flagged("q1", "questioned")]));
    expect(once.lines).toEqual([
      { say: "goodCatch", text: null, line: null },
      { say: "anotherWay", text: m.wordings[0], line: "c1.wording.1" },
    ]);
    expect(once).toMatchObject({ asking: "number", prompt: { text: m.wordings[0] } });
    // Right on the other wording: the part is done, with no "How did you get that?" on the way.
    expect(mathState(market, [flagged("q1", "questioned"), said("q1", true)]).at).toBe(1);
    const twice = mathState(market, [flagged("q1", "questioned"), flagged("q1", "questioned")]);
    expect(twice.kind).toBe("handed_off");
    expect(mathView(market, twice)).toMatchObject({ handedOff: true, handoff: MARKET.handoff });
  });

  it("anything else: \"What number do you get?\", then another wording, and a person when none is left: never looped", () => {
    expect(mathView(market, mathState(market, [flagged("q1", "no_number")]))).toMatchObject({
      lines: [{ say: "whatNumber", text: null, line: null }],
      asking: "number",
      prompt: { text: MARKET.parts[0].question },
    });
    const two = mathView(market, mathState(market, [flagged("q1", "no_number"), flagged("q1", "no_number")]));
    expect(two.lines.slice(-1)).toEqual([{ say: "anotherWay", text: m.wordings[0], line: "c1.wording.1" }]);
    const four = [1, 2, 3, 4].map(() => flagged("q1", "no_number"));
    const after4 = mathState(market, four);
    expect(after4.run.wording2).toBe(true);
    expect(mathState(market, [...four, ...[1, 2].map(() => flagged("q1", "no_number"))]).kind).toBe("handed_off");
  });
});
