import { describe, expect, it } from "vitest";
import { ageFrom, answerOf, ANSWER_IDS, defaultAge, parseChooserExport, settingFor } from "./beliefs";

describe("answers and settings", () => {
  it("round-trips each of the five answers", () => {
    for (const id of ANSWER_IDS) expect(answerOf(settingFor(id))).toBe(id);
  });

  it("maps answers to the spec's when and perspective", () => {
    expect(settingFor("ours")).toEqual({ when: "anytime", perspective: "family_tradition" });
    expect(settingFor("fair")).toEqual({ when: "anytime", perspective: "several_fairly" });
    expect(settingFor("us")).toEqual({ when: "parent_led", perspective: "omitted" });
    expect(settingFor("never")).toEqual({ when: "never", perspective: "omitted" });
  });

  it("takes the ready-to-answer perspective for Not yet from the pack, then the current answer", () => {
    const pack = { when: "from_age", perspective: "family_tradition" } as const;
    const current = { when: "from_age", perspective: "several_fairly" } as const;
    expect(settingFor("later", pack, current).perspective).toBe("family_tradition");
    expect(settingFor("later", null, { ...current, perspective: "family_tradition" }).perspective).toBe("family_tradition");
    expect(settingFor("later", { when: "from_age", perspective: "omitted" }).perspective).toBe("several_fairly");
    expect(settingFor("later", null, { when: "anytime", perspective: "family_tradition" }).perspective).toBe("several_fairly");
  });
});

describe("ages", () => {
  it("starts Not yet at the pack's age, else two years on", () => {
    expect(defaultAge(12, 7)).toBe(12);
    expect(defaultAge(null, 7)).toBe(9);
    expect(defaultAge(null, 17)).toBe(18);
  });

  it("counts birthdays by month", () => {
    const now = new Date(2026, 9, 11); // October 2026
    expect(ageFrom("2017-03-01", now)).toBe(9);
    expect(ageFrom("2017-10-01", now)).toBe(9);
    expect(ageFrom("2017-11-01", now)).toBe(8);
  });
});

describe("parseChooserExport", () => {
  const good = {
    kind: "quark-beliefs",
    lean: "moderate",
    quick: "nothing-in-particular",
    mine: { "3": { a: "fair", pack: "nothing-in-particular" }, "1": { a: "us", pack: null } },
  };

  it("reads the tryout page's answers in point order", () => {
    expect(parseChooserExport(JSON.stringify(good))).toEqual({
      lean: "moderate",
      quick: "nothing-in-particular",
      answers: [
        { point: 1, answer: "us", pack: null },
        { point: 3, answer: "fair", pack: "nothing-in-particular" },
      ],
    });
  });

  it("skips anything it doesn't recognize", () => {
    const odd = { ...good, lean: "left", mine: { ...good.mine, "25": { a: "fair" }, "4": { a: "maybe" }, "5": { a: "ours", pack: "../x" } } };
    const result = parseChooserExport(JSON.stringify(odd));
    expect(result).toMatchObject({ lean: "unset" });
    expect("answers" in result && result.answers.map((a) => a.point)).toEqual([1, 3, 5]);
    expect("answers" in result && result.answers[2].pack).toBeNull();
  });

  it("refuses text that isn't an export", () => {
    expect(parseChooserExport("hello")).toHaveProperty("error");
    expect(parseChooserExport(JSON.stringify({ mine: {} }))).toHaveProperty("error");
    expect(parseChooserExport(JSON.stringify({ ...good, mine: {} }))).toHaveProperty("error");
  });
});
