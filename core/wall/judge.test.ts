import { describe, expect, it } from "vitest";
import { JUDGE_SCHEMA, judgeAnswer, judgePrompt, readJudgement, VERDICTS, type JudgeInput } from "./judge.ts";

const input: JudgeInput = {
  text: "Pip, look at the wave. Mount Fuji sits small behind it.",
  question: "Where in the picture is Mount Fuji hiding, Pip?",
  key: { accept: ["in the background", "behind the wave"], rubric: "Anything that places it far back." },
  hints: ["Look past the big wave. What is small and far away?"],
  band: "2-3",
  guess: "pip thinks in the back",
  nickname: "Pip",
};

describe("what the judge is sent", () => {
  it("carries the card, the key, the hints shown, the band and the guess", () => {
    const p = judgePrompt(input);
    for (const part of ["The card's words:", "The question:", "- in the background", "- behind the wave", "What counts: Anything that places it far back.", "1. Look past the big wave.", "grades 2-3", "in the back"]) {
      expect(p).toContain(part);
    }
  });

  it("never names the child (rule 7): the nickname is sent as the child, wherever it is", () => {
    const p = judgePrompt(input);
    expect(p).not.toMatch(/pip/i);
    expect(p).toContain("the child, look at the wave");
    // A name inside another word is left alone.
    expect(judgePrompt({ ...input, nickname: "Al", text: "Always look.", question: "Al, what?" })).toContain("Always look.");
  });

  it("says when no hint has been shown, and leaves out what it doesn't have", () => {
    const p = judgePrompt({ ...input, hints: [], band: null, text: "", key: { accept: ["x"], rubric: "" } });
    expect(p).toContain("None.");
    expect(p).toContain("(none)");
    expect(p).not.toMatch(/grades|What counts/);
  });
});

describe("the judge's reply", () => {
  it("is one of the five verdicts, with the reason first in the schema", () => {
    expect(Object.keys(JUDGE_SCHEMA.properties)).toEqual(["reason", "verdict"]);
    for (const v of VERDICTS) expect(readJudgement({ reason: "r", verdict: v }, 1)).toEqual({ verdict: v, reasoning: "r" });
    expect(readJudgement({ reason: "r", verdict: "maybe" }, 1)).toBeNull();
    expect(readJudgement(null, 1)).toBeNull();
  });

  it("reads an answer to the hint as not yet when no hint was shown", () => {
    expect(readJudgement({ reason: "r", verdict: "hint" }, 0)?.verdict).toBe("not_yet");
  });
});

describe("the time limit", () => {
  it("returns the verdict when the model answers in time", async () => {
    const r = await judgeAnswer(input, async () => ({ reason: "places it far back", verdict: "right" }), 1000);
    expect(r).toMatchObject({ judgement: { verdict: "right", reasoning: "places it far back" }, tries: 1, fault: null });
  });

  it("tries once more after a quick failure, inside the same limit", async () => {
    let calls = 0;
    const r = await judgeAnswer(
      input,
      async () => {
        calls += 1;
        if (calls === 1) throw new Error("overloaded");
        return { reason: "ok", verdict: "close" };
      },
      3000,
    );
    expect(r).toMatchObject({ judgement: { verdict: "close" }, tries: 2 });
  });

  it("gives up at the limit, so the word rule judges, and never waits longer", async () => {
    const started = Date.now();
    const r = await judgeAnswer(input, () => new Promise(() => {}), 200);
    expect(r.judgement).toBeNull();
    expect(r.fault).toMatch(/no verdict within/);
    expect(Date.now() - started).toBeLessThan(600);
  });

  it("gives up on a reply it can't read, when no time is left for a second try", async () => {
    const r = await judgeAnswer(input, async () => ({ verdict: "sure" }), 500);
    expect(r).toMatchObject({ judgement: null, tries: 1, fault: "a reply that could not be read" });
  });

  it("passes the time left to the call", async () => {
    let given = 0;
    await judgeAnswer(input, async ({ timeoutMs }) => {
      given = timeoutMs;
      return { reason: "r", verdict: "not_yet" };
    }, 3000);
    expect(given).toBeGreaterThan(2900);
    expect(given).toBeLessThanOrEqual(3000);
  });
});
