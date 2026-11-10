import { describe, expect, it } from "vitest";
import { evaluate, leaves, operations, parseExpr, values, workOut } from "./expr";
import { numbersOf, readNumber } from "./numbers";

describe("parseExpr and evaluate", () => {
  it("works out a sum in the problem's own signs, brackets first, times before plus", () => {
    expect(evaluate(parseExpr("7 × (2 + 1)"))).toBe(21);
    expect(evaluate(parseExpr("2 + 3 * 4"))).toBe(14);
    expect(evaluate(parseExpr("24 ÷ 3"))).toBe(8);
    expect(evaluate(parseExpr("$20 − $16"))).toBe(4);
    expect(evaluate(parseExpr("1,000 - 246"))).toBe(754);
    expect(evaluate(parseExpr("14 % 4"))).toBe(2);
  });

  it("refuses a share that does not come out even, a sum below zero, and anything that is not a sum", () => {
    expect(workOut("25 / 4")).toEqual({ problem: "25 / 4 is not a whole number" });
    expect(workOut("6 - 9")).toEqual({ problem: "6 - 9 goes below zero" });
    expect("problem" in workOut("two times four")).toBe(true);
    expect("problem" in workOut("(3 + 4")).toBe(true);
    expect("problem" in workOut("")).toBe(true);
  });

  it("lists the numbers it is written with, every piece's value, and its operations, a chain of additions as one", () => {
    const e = parseExpr("7 × (2 + 1)");
    expect(leaves(e)).toEqual([7, 2, 1]);
    expect(values(e)).toEqual([7, 2, 1, 3, 21]);
    expect(operations(e)).toEqual([
      { op: "+", operands: [2, 1], result: 3 },
      { op: "x", operands: [7, 3], result: 21 },
    ]);
    expect(operations(parseExpr("8 + 4 + 5 + 3"))).toEqual([{ op: "+", operands: [8, 4, 5, 3], result: 20 }]);
  });
});

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
  it("reads 6 from the ways a child says it (the look's check 6)", () => {
    for (const reply of ["6", "six", "6 sets", "about six", "Six!", "it's 6", "I think it is 6", "6 sets of 4"]) expect(readNumber(reply)).toEqual({ value: 6 });
  });

  it("takes the number after the last is or =, so the working counts", () => {
    expect(readNumber("3 times 8 is 24")).toEqual({ value: 24 });
    expect(readNumber("24/4=6")).toEqual({ value: 6 });
    expect(readNumber("4 and 4 makes 8")).toEqual({ value: 8 });
    expect(readNumber("$4")).toEqual({ value: 4 });
    expect(readNumber("twenty one")).toEqual({ value: 21 });
  });

  it("takes no number from a hedge or from words alone", () => {
    expect(readNumber("6 or 7")).toEqual({ none: "two_answers" });
    expect(readNumber("maybe 6, or maybe 7")).toEqual({ none: "two_answers" });
    expect(readNumber("lots")).toEqual({ none: "no_number" });
    expect(readNumber("I don't know")).toEqual({ none: "no_number" });
  });
});

describe("the sum line (fix round 4)", async () => {
  const { sumLine, sumSpoken } = await import("./expr");
  it("writes the sum from the expression with the school's signs, brackets only where the sum needs them", () => {
    expect(sumLine("120 + 250")).toBe("120 + 250 = ?");
    expect(sumLine("7 * 3")).toBe("7 × 3 = ?");
    expect(sumLine("24 / 3")).toBe("24 ÷ 3 = ?");
    expect(sumLine("20 - 16")).toBe("20 − 16 = ?");
    expect(sumLine("7 × (2 + 1)")).toBe("7 × (2 + 1) = ?");
    expect(sumLine("(6 × 4)")).toBe("6 × 4 = ?");
    expect(sumLine("10 - (4 + 4)")).toBe("10 − (4 + 4) = ?");
    expect(sumLine("8 + 4 + 5 + 3")).toBe("8 + 4 + 5 + 3 = ?");
    expect(sumLine("1000 - 246")).toBe("1,000 − 246 = ?");
  });

  it("shows nothing for a bare number, which would be the answer itself", () => {
    expect(sumLine("4")).toBeNull();
    expect(sumLine("not a sum")).toBeNull();
  });

  it("says it in words for Read it to me", () => {
    expect(sumSpoken("120 + 250")).toBe("120 plus 250 equals what?");
    expect(sumSpoken("24 / 3")).toBe("24 divided by 3 equals what?");
    expect(sumSpoken("7 × (2 + 1)")).toBe("7 times, 2 plus 1 together equals what?");
  });
});
