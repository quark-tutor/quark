import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cleanCards, type RawCards } from "./cards";
import { cleanEnds, hasBrace } from "./clean";

describe("cleanEnds", () => {
  it("drops stray braces and brackets at either end", () => {
    expect(cleanEnds("tell you where it begins.}")).toBe("tell you where it begins.");
    expect(cleanEnds("  {Ask Dad.]} ")).toBe("Ask Dad.");
  });

  it("drops a double quote only when it has no partner", () => {
    expect(cleanEnds('Ask Dad what a dam does."')).toBe("Ask Dad what a dam does.");
    expect(cleanEnds('He called it "the black land."')).toBe('He called it "the black land."');
    expect(cleanEnds("“Wonderful things,” said Carter.")).toBe("“Wonderful things,” said Carter.");
    expect(cleanEnds("the boys' boat")).toBe("the boys' boat");
  });

  it("finds a brace left inside", () => {
    expect(hasBrace("Ask {Dad}")).toBe(true);
    expect(hasBrace("Ask Dad")).toBe(false);
  });
});

describe("the real reply with a stray brace (day 1 wonder, 14 Oct 2026)", () => {
  const { text } = JSON.parse(readFileSync(join(__dirname, "fixtures", "cards-day1-wonder.json"), "utf8"));
  const raw = JSON.parse(text) as RawCards;

  it("came that way from the model: the JSON parses, and the brace is inside the string", () => {
    expect(raw.card_1!.handoff).toBe("Ask a grown-up at home to show you the Nile on a map and tell you where it begins.}");
  });

  it("is cleaned before it's checked or saved, and nothing else changes", () => {
    const clean = cleanCards(raw);
    expect(clean.card_1!.handoff).toBe("Ask a grown-up at home to show you the Nile on a map and tell you where it begins.");
    expect(clean.card_2).toEqual(raw.card_2);
    const words = Object.values(clean).flatMap((c) => [c!.title, c!.text, c!.image_alt, c!.read_aloud, c!.question, c!.handoff, ...c!.hints]);
    expect(words.filter(hasBrace)).toEqual([]);
  });
});
