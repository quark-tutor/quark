import { describe, expect, it } from "vitest";
import { choicesOf, isGuess, judgeGuess, slip } from "./answer.ts";

const key = (...accept: string[]) => ({ accept, rubric: "" });
const Q = "What is it?";

describe("the word rule, as the hint check has it", () => {
  it("is right when the guess holds every meaningful word of an accepted answer", () => {
    expect(judgeGuess("cello", key("the cello"), Q)).toBe("right");
    expect(judgeGuess("I think it's the cello one", key("the cello"), Q)).toBe("right");
    expect(judgeGuess("the violin", key("the cello"), Q)).toBe("not_yet");
    expect(judgeGuess("rain", key("rain in the mountains"), Q)).toBe("not_yet");
  });

  it("needs a word as often as the answer uses it", () => {
    expect(judgeGuess("6", key("6 and 6"), Q)).toBe("not_yet");
    expect(judgeGuess("six and six", key("6 and 6"), Q)).toBe("right");
  });

  it("reads digits as number words, yeah and nope as yes and no, and the iPad's curly apostrophe as plain", () => {
    expect(judgeGuess("4", key("four"), Q)).toBe("right");
    expect(judgeGuess("like 4 hundred bucks", key("four hundred"), Q)).toBe("right");
    expect(judgeGuess("yeah, over and over", key("yes"), "Can you print it more than once?")).toBe("right");
    expect(judgeGuess("they didn’t believe him", key("they didn't believe him"), Q)).toBe("right");
  });
});

describe("a one-letter slip", () => {
  it("is forgiven in a word of five letters or more: added, dropped, changed or two swapped", () => {
    expect(slip("chello", "cello")).toBe(true);
    expect(slip("cell", "cello")).toBe(true);
    expect(slip("cellp", "cello")).toBe(true);
    expect(slip("celol", "cello")).toBe(true);
    expect(judgeGuess("the chello", key("the cello"), Q)).toBe("right");
  });

  it("is not forgiven in a shorter word, two letters off, or in a number", () => {
    expect(slip("blu", "blue")).toBe(false);
    expect(slip("selo", "cello")).toBe(false);
    expect(slip("401", "400")).toBe(false);
    expect(judgeGuess("blu", key("blue"), Q)).toBe("not_yet");
  });
});

describe("not", () => {
  it("makes a guess not right unless the accepted answer has it too", () => {
    expect(judgeGuess("not north", key("north"), Q)).toBe("not_yet");
    expect(judgeGuess("it's not a lie", key("a mistake", "not a lie"), "Was that a lie or a mistake?")).toBe("right");
    expect(judgeGuess("they did not believe him", key("they didn't believe him"), Q)).toBe("right");
    expect(judgeGuess("never north", key("north"), Q)).toBe("not_yet");
  });
});

describe("a choice of two", () => {
  const upper = "Upper Egypt was upriver. Was it in the north or the south?";

  it("finds the right side from the accepted answers and the other side next to the or", () => {
    expect(choicesOf(upper, ["south", "the south"])).toEqual({ right: ["south"], other: ["north"] });
    expect(choicesOf("Would a big, heavy elephant suit high, quick notes or low, slow notes?", ["low, slow notes"])).toEqual({
      right: ["low", "slow", "note"],
      other: ["high", "quick"],
    });
  });

  it("leaves out the words both sides share", () => {
    const q = "On Mercator's map, which gets stretched more: a place near the equator or a place near the North Pole?";
    expect(choicesOf(q, ["near the North Pole", "the pole"])?.other).toEqual(["equator"]);
    expect(judgeGuess("a place near the north pole", key("near the North Pole"), q)).toBe("right");
  });

  it("finds a right side before the or, nearest it", () => {
    const q = 'A says "B is a knave" and B says "We are both knights." B turns out to be a knave. So is A a knight or a knave?';
    expect(choicesOf(q, ["a knight", "knight"])).toEqual({ right: ["knight"], other: ["knave"] });
  });

  it("offers yes and no on a yes-or-no question", () => {
    expect(choicesOf('Could a knave say, "I am a knave"?', ["no", "no, it would be true"])).toEqual({ right: ["no"], other: ["yes"] });
  });

  it("is not right when the guess holds both choices", () => {
    expect(judgeGuess("south", key("south", "the south"), upper)).toBe("right");
    expect(judgeGuess("north or south", key("south", "the south"), upper)).toBe("not_yet");
    expect(judgeGuess("north", key("south", "the south"), upper)).toBe("not_yet");
    expect(judgeGuess("yes or no", key("no", "no, it would be true"), 'Could a knave say, "I am a knave"?')).toBe("not_yet");
    expect(judgeGuess("nope", key("no", "no, it would be true"), 'Could a knave say, "I am a knave"?')).toBe("right");
  });

  it("is not found when the question names two choices without an or", () => {
    expect(choicesOf("The Big Island still has active volcanoes and Kauaʻi does not. Which of the two islands is younger?", ["the Big Island"])).toBeNull();
  });
});

describe("what isn't a guess", () => {
  it("is a blank, no letter or digit, or I don't know in its usual forms", () => {
    for (const g of ["", "   ", "?", "...", "idk", "IDK.", "I don't know", "I don’t know", "dunno", "no idea", "not sure"]) {
      expect(isGuess(g), g).toBe(false);
      expect(judgeGuess(g, key("north"), Q), g).toBe("not_a_guess");
    }
  });

  it("leaves a plain no or a number as a guess", () => {
    expect(isGuess("no")).toBe(true);
    expect(isGuess("0")).toBe(true);
  });
});

describe("an open question", () => {
  it("takes any real guess, and still not I don't know", () => {
    expect(judgeGuess("because copies are still pretty", key(), Q)).toBe("open");
    expect(judgeGuess("idk", key(), Q)).toBe("not_a_guess");
  });
});

describe("the any rule", () => {
  it("is right when the guess holds any meaningful word of an accepted answer", () => {
    expect(judgeGuess("a bunch of teeny dots", key("tiny dots"), Q, "every")).toBe("not_yet");
    expect(judgeGuess("a bunch of teeny dots", key("tiny dots"), Q, "any")).toBe("right");
  });

  it("keeps the not and both-choices guards", () => {
    expect(judgeGuess("not dots", key("tiny dots"), Q, "any")).toBe("not_yet");
    expect(judgeGuess("north or south", key("south"), "Was it in the north or the south?", "any")).toBe("not_yet");
  });
});
