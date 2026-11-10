import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseLadder, type Place } from "../../lib/ladder";
import { checkMath } from "./check";
import type { MathDay, MathProblem } from "./problem";
import { CONES, MARKET } from "./samples";

const ladder = parseLadder(readFileSync(join(__dirname, "..", "..", "plan", "math-ladder.yaml"), "utf8"));
// The brief's starting places (docs/math-tile-slice.md, The ladder), for two invented children.
const OLDER = new Map<string, Place>([["add-20", "done"], ["add-100", "done"], ["place-value", "done"], ["add-1000", "working"], ["groups-of", "working"], ["times-2-5-10", "working"]]);
const YOUNGER = new Map<string, Place>([["add-20", "done"], ["add-100", "done"], ["place-value", "done"], ["groups-of", "done"], ["times-2-5-10", "done"], ["times-3-4", "working"]]);
const money: MathDay = { day: 3, teaches: "money", everyday: true, isNew: true, style: "short" };
const threesFours: MathDay = { day: 1, teaches: "times-3-4", everyday: false, isNew: false, style: "hidden" };

const older = (p: MathProblem, day = money) => checkMath(p, { day, ladder, places: OLDER });
const younger = (p: MathProblem, day = threesFours) => checkMath(p, { day, ladder, places: YOUNGER });
const edit = (p: MathProblem, f: (q: MathProblem) => void) => {
  const q = structuredClone(p);
  f(q);
  return q;
};

describe("checkMath", () => {
  it("passes the problems Brandon and June read, problem 5 for the older boy and problem 12 for the younger", () => {
    expect(older(MARKET)).toEqual([]);
    expect(younger(CONES)).toEqual([]);
  });

  it("works out every answer itself, and the last step lands on the part's answer", () => {
    expect(older(edit(MARKET, (q) => (q.parts[0].answer = 8)))).toContain("part 1: the answer is written as 8 but 3 × 2 works out to 6");
    expect(older(edit(MARKET, (q) => (q.parts[1].steps[1].answer = 11)))).toEqual(
      expect.arrayContaining(["part 2, step 2: the answer is written as 11 but 5 + 5 works out to 10", "part 2: the last step's answer is 11, not the part's answer, 10"]),
    );
    expect(older(edit(MARKET, (q) => (q.parts[3].expression = "20 / 3")))).toContain("part 4: 20 / 3 is not a whole number");
  });

  it("holds the parts to one thing worth finding out: none stands alone, and the last uses an earlier answer (Brandon, 9 Nov 2026)", () => {
    // Problem 3 as written at stop 1: four separate sums in one setting.
    const separate = edit(MARKET, (q) => {
      q.parts[2] = { ...q.parts[2], question: "There are 4 tables, with 5 cups on each table. How many cups?", answer: 20, expression: "4 × 5", wordings: ["4 tables, 5 cups on every table. How many cups?", "How many is 4 fives?"], steps: [{ question: "How many cups on 2 tables?", answer: 10, expression: "2 × 5" }, { question: "And 4 tables?", answer: 20, expression: "4 × 5" }], working: ["4 × 5 = 20.", "There are 20 cups."] };
      q.parts[3] = { ...q.parts[3], question: "7 kids each blow up 2 balloons. How many balloons?", answer: 14, expression: "7 × 2", wordings: ["7 kids, 2 balloons each. How many?", "How many is 7 twos?"], steps: [{ question: "How many for 5 kids?", answer: 10, expression: "5 × 2" }, { question: "Together with the other 2 kids?", answer: 14, expression: "10 + 4" }], working: ["7 × 2 = 14.", "14 balloons."] };
    });
    expect(older(separate)).toEqual(
      expect.arrayContaining([
        "part 4 uses no earlier part's answer: the parts build toward part 4, each one needed for it",
        "part 1 stands alone: no other part uses its answer, 6, and it uses none; every part builds toward part 4",
        "part 2 stands alone: no other part uses its answer, 10, and it uses none; every part builds toward part 4",
      ]),
    );
    // The younger boy's quick one at the end may stand alone; part 3 is what the others build toward.
    expect(younger(edit(CONES, (q) => (q.parts[2].expression = "24 - 20")))).toEqual(
      expect.arrayContaining(["part 2 stands alone: no other part uses its answer, 15, and it uses none; every part builds toward part 3"]),
    );
  });

  it("refuses a wording that brings in a new number, and anything that says the answer before he does", () => {
    expect(older(edit(MARKET, (q) => (q.parts[0].wordings[1] = "How much is 4 lots of $2?")))).toContain("part 1: its second other wording brings in 4, which the problem does not have");
    expect(older(edit(MARKET, (q) => (q.parts[2].tie = "It's like 16 points in a game.")))).toContain("part 3: its tie says its answer, 16");
    expect(older(edit(MARKET, (q) => (q.setting += " The stand has 4 kinds of fruit.")))).toContain("part 4: the setting says its answer, 4");
    expect(older(edit(MARKET, (q) => (q.parts[3].steps[0].question = "Count up from $16 to $20: is it 4?")))).toContain("part 4, step 1: says the part's answer, 4");
  });

  it("keeps every sum on his rungs: the 3s and 4s are the younger's, not the older's yet", () => {
    expect(older(edit(MARKET, (q) => ((q.parts[0].expression = "3 × 7"), (q.parts[0].answer = 21))))).toEqual(
      expect.arrayContaining(["part 1: 3 × 7 is not on any of his rungs"]),
    );
    // Two real operations in one sum is a two-step problem, which neither boy has; a hidden 2 + 1 is fine.
    expect(younger(edit(CONES, (q) => ((q.parts[0].expression = "6 × 4 + 3 × 4"), (q.parts[0].answer = 36))))).toContain(
      "part 1: two operations in one sum, and neither is a quick sum to 20 (two-step problems are not his yet)",
    );
    expect(younger(edit(CONES, (q) => ((q.setting += " Each square is 3 cones and 1 more."), (q.parts[0].expression = "6 × (3 + 1)"))))).toEqual([]);
  });

  it("holds each boy's style: one short sum a part for the older, a single sum for the younger's quick one", () => {
    expect(older(edit(MARKET, (q) => (q.parts[0].expression = "3 × (1 + 1)")))).toContain("part 1: one short sum a part, and this has 2 operations");
    expect(younger(edit(CONES, (q) => (q.parts[3].expression = "7 × (2 + 1)")))).toContain("part 4: the quick one is a single sum");
  });

  it("wants the worked example on a new rung, on other numbers, with a picture that is its own sum", () => {
    expect(older(edit(MARKET, (q) => (q.example = null)))).toContain("no worked example, and money is new to him");
    expect(older(edit(MARKET, (q) => (q.example!.picture = { kind: "groups", numbers: [3, 4], labels: ["", ""] })))).toContain("the worked example's picture: 3 groups of 4 is not in its sum");
    expect(older(edit(MARKET, (q) => (q.example!.expression = "3 × 2")))).toContain("the worked example uses part 1's own numbers: it is on other numbers");
  });

  it("wants every number a part's sum needs on screen by then: the setting, its own question, or an earlier answer (Brandon, 9 Nov 2026)", () => {
    // Test's Tuesday problem as written: the trucks' wheels are "two in front and two in back", and the sum says 4.
    const trucks = edit(CONES, (q) => {
      q.setting = "At the beach park, a row of trucks is parked by the sand. Every truck has two wheels in front and two in back.";
      q.parts[0].question = "6 trucks are parked in a row. How many wheels do they have?";
      q.parts[0].wordings = ["Every truck has 4 wheels. How many wheels do 6 trucks have?", "How many is 6 fours?"];
    });
    expect(younger(trucks)).toContain(
      "part 1: its sum needs 4, which is not on screen by then: say it in the setting or this part's question, or write the sum from the numbers there and the earlier answers",
    );
    // Written out from what is on screen, it passes.
    expect(younger(edit(trucks, (q) => (q.parts[0].expression = "6 × (2 + 2)")))).not.toEqual(expect.arrayContaining([expect.stringMatching(/^part 1: its sum needs/)]));
    // A number from an earlier part's question is not on screen on a later part's page; its answer is.
    expect(older(edit(MARKET, (q) => ((q.parts[3].question = "How much change do you get back?"), (q.parts[3].wordings = ["How many dollars come back to you?", "What do you add to $16 to make $20?"]))))).toContain(
      "part 4: its sum needs 20, which is not on screen by then: say it in the setting or this part's question, or write the sum from the numbers there and the earlier answers",
    );
  });

  it("keeps signs out of everything he reads before he answers: a sum is said in words", () => {
    expect(younger(edit(CONES, (q) => (q.parts[0].wordings[1] = "What is 6 × 4?")))).toContain('part 1: its second other wording shows a sign, "What is 6 × 4?": say the sum in words');
    expect(younger(edit(CONES, (q) => (q.parts[2].steps[0].question = "What is 20 - 15?")))).toContain('part 3: step 1 shows a sign, "What is 20 - 15?": say the sum in words');
    expect(older(edit(MARKET, (q) => (q.parts[0].question = "You buy 3 bunches at $2 (the small ones). How many dollars?")))).toContain(
      'part 1: its question shows a sign, "You buy 3 bunches at $2 (the small ones). How many dollars?": say the sum in words',
    );
  });

  it("wants two parts on the day's rung, and the shape whole", () => {
    expect(younger(CONES, { ...threesFours, teaches: "sharing" })).toContain("only 0 parts are on today's rung, sharing: at least two");
    expect(older(edit(MARKET, (q) => q.parts.pop()))).toEqual(["needs 4 parts, has 3"]);
    expect(older(edit(MARKET, (q) => (q.parts[1].wordings = ["Only one way."])))).toContain("part 2: needs two other wordings, has 1");
    expect(older(edit(MARKET, (q) => (q.title = "For smart kids")))).toContain('uses a brilliance word ("smart"); use effort words');
  });
});

describe("where each day's problem is set (fix round 3)", () => {
  it("takes the family's places and things and his interests in turn, a day each, each brother from a different one", async () => {
    const { settingsFor } = await import("../curation/math");
    const familiar = ["the coast", "the mountains", "skating"];
    expect(settingsFor({ familiar, interests: ["trains", "drawing"], turn: 0 }, 7)).toEqual(["the coast", "trains", "the mountains", "drawing", "skating", "the coast", "trains"]);
    expect(settingsFor({ familiar, interests: ["trains", "drawing"], turn: 1 }, 3)).toEqual(["trains", "the mountains", "drawing"]);
    expect(settingsFor({ familiar: [], interests: [], turn: 0 }, 2)).toEqual([null, null]);
    expect(settingsFor({ familiar: ["Trains"], interests: ["trains"], turn: 0 }, 2)).toEqual(["Trains", "Trains"]);
  });
});

describe("core/prompts/math.md", () => {
  it("shows the model the same two problems the tests hold, word for word", () => {
    const md = readFileSync(join(__dirname, "..", "prompts", "math.md"), "utf8").replace(/\r\n/g, "\n");
    const blocks = (md.match(/```json\n[\s\S]*?\n```/g) ?? []).map((b) => JSON.parse(b.slice(8, -4)));
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ ...MARKET });
    expect(blocks[1]).toEqual({ ...CONES, example: { text: "", working: [], expression: "", picture: { kind: "none", numbers: [], labels: [] } } });
  });
});
