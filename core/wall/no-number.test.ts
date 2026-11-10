import { describe, expect, it } from "vitest";
import { noNumberPrompt, readNoNumber, readReply } from "./no-number";

const input = { setting: "Every truck has two wheels in front and two in back.", question: "How many wheels do the trucks and the trikes have all together?", said: "this question is impossible to answer without more information" };

describe("the judge of a reply with no number", () => {
  it("is told the setting, the question and his words, and nothing about him", () => {
    expect(noNumberPrompt(input)).toBe(`The setting: ${input.setting}\n\nThe question: ${input.question}\n\nThe child's reply:\n${input.said}`);
  });

  it("returns one of three verdicts, and anything else cannot be read", () => {
    expect(readNoNumber({ reason: "Says the counts are missing.", verdict: "questioned" })).toEqual({ verdict: "questioned", reasoning: "Says the counts are missing." });
    expect(readNoNumber({ reason: "", verdict: "right" })).toBeNull();
  });

  it("takes the model's verdict, and \"other\" when none comes in time, so the tile still answers kindly", async () => {
    expect(await readReply(input, async () => ({ reason: "Says it cannot be answered.", verdict: "questioned" }))).toMatchObject({ verdict: "questioned", by: "model" });
    const late = await readReply(input, () => new Promise(() => {}), 50);
    expect(late).toMatchObject({ verdict: "other", by: "rule" });
    expect(late.fault).toMatch(/no verdict within/);
  });
});
