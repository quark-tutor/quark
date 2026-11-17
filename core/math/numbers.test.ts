import { describe, expect, it } from "vitest";
import { numbersOf, readNumber } from "./numbers";

describe("numbersIn", () => {
  it("reads digits and numbers in words", () => {
    expect(numbersOf("8 ʻukulele, an ʻukulele has four strings")).toEqual([8, 4]);
    expect(numbersOf("twenty-four shells and a hundred and six cups")).toEqual([24, 106]);
    expect(numbersOf("three hundred and seventy, then 1,000, then $16")).toEqual([370, 1000, 16]);
    expect(numbersOf("two cartons of a dozen eggs")).toEqual([2, 12]);
    expect(numbersOf("no numbers here, and nothing in 'anyone'")).toEqual([]);
  });
});

describe("readNumber", () => {
  it("reads 6 from the ways a child says it", () => {
    for (const reply of ["6", "six", "6 sets", "about six", "Six!", "it's 6", "I think it is 6", "6 sets of 4"]) expect(readNumber(reply)).toEqual({ value: 6 });
  });

  it("takes the number after the last is or =, so the working counts", () => {
    expect(readNumber("3 times 8 is 24")).toEqual({ value: 24 });
    expect(readNumber("24/4=6")).toEqual({ value: 6 });
    expect(readNumber("4 and 4 makes 8")).toEqual({ value: 8 });
    expect(readNumber("$4")).toEqual({ value: 4 });
    expect(readNumber("twenty one")).toEqual({ value: 21 });
  });

  it("reads a total in dollars, as the trading boat asks for it", () => {
    expect(readNumber("$30")).toEqual({ value: 30 });
    expect(readNumber("thirty dollars")).toEqual({ value: 30 });
    expect(readNumber("6 times 5 is 30 dollars")).toEqual({ value: 30 });
    expect(readNumber("one hundred")).toEqual({ value: 100 });
  });

  it("takes no number from a hedge or from words alone", () => {
    expect(readNumber("6 or 7")).toEqual({ none: "two_answers" });
    expect(readNumber("maybe 6, or maybe 7")).toEqual({ none: "two_answers" });
    expect(readNumber("lots")).toEqual({ none: "no_number" });
    expect(readNumber("I don't know")).toEqual({ none: "no_number" });
  });
});
