import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parsePlan, planRows, planWarnings, validatePlan, type Plan } from "./plan";

const dir = join(__dirname, "..", "plan");
const files = readdirSync(dir).filter((f) => f.endsWith(".yaml"));

describe.each(files)("plan/%s", (file) => {
  const plan = parsePlan(readFileSync(join(dir, file), "utf8"));

  it("is valid", () => {
    expect(validatePlan(plan)).toEqual([]);
  });

  it("is named after its file", () => {
    expect(`${plan.stretch}.yaml`).toBe(file);
  });
});

function topic(subject: string, slot: string) {
  return { subject, slot, title: `${subject} topic`, summary: { "2-3": "Younger.", "4-5": "Older." } };
}

function smallPlan(): Plan {
  return {
    stretch: "test",
    title: "Test",
    sequence: 2,
    sources: [{ id: "met-1", title: "A thing", publisher: "The Met", url: "https://example.org/1", license: "CC0" }],
    weeks: [
      {
        week: 1,
        title: "The river",
        why: "Everything starts here.",
        perspective: "several_fairly",
        values_points: [12],
        topics: [
          topic("geography", "then"),
          { ...topic("science", "wonder"), parent_note: "  An experiment.  " },
          { ...topic("art", "look"), sources: ["met-1"] },
          topic("music", "listen"),
          topic("literature", "then"),
          topic("math", "puzzle"),
        ],
      },
    ],
  } as Plan;
}

describe("validatePlan", () => {
  it("accepts a week with history or geography", () => {
    expect(validatePlan(smallPlan())).toEqual([]);
  });

  it("names a missing subject, slot, band and source", () => {
    const plan = smallPlan();
    const topics = plan.weeks[0].topics;
    plan.weeks[0].topics = topics.filter((t) => t.subject !== "math" && t.subject !== "geography");
    plan.weeks[0].topics[0] = { ...plan.weeks[0].topics[0], slot: "ask" as never, sources: ["nope"] };
    plan.weeks[0].topics[1] = { ...plan.weeks[0].topics[1], summary: { "2-3": "Only one." } as never };
    expect(validatePlan(plan)).toEqual(
      expect.arrayContaining([
        "week 1: missing math",
        "week 1: missing history or geography",
        "week 1 science: slot must be one of look, wonder, listen, then, puzzle",
        "week 1 science: source \"nope\" is not listed",
        "week 1 art: missing summary for 4-5",
        "week 1: no topic feeds the puzzle card",
      ]),
    );
  });

  it("wants weeks in order and values points with a perspective", () => {
    const plan = smallPlan();
    plan.weeks[0] = { ...plan.weeks[0], week: 2, perspective: undefined, values_points: [25] };
    expect(validatePlan(plan)).toEqual(
      expect.arrayContaining([
        "weeks must be numbered 1, 2, 3... in order; found 2 at position 1",
        "week 2: values point 25 is not 1-24",
        "week 2: values_points need a perspective",
      ]),
    );
  });

  it("checks sources and the stretch's own fields", () => {
    const plan = { ...smallPlan(), stretch: "Ancient Egypt", sequence: 0 };
    plan.sources = [...plan.sources, { ...plan.sources[0], url: "http://example.org", license: "" }];
    expect(validatePlan(plan)).toEqual(
      expect.arrayContaining([
        "stretch must be lowercase words joined by hyphens",
        "sequence must be a whole number from 1",
        "source met-1: missing license",
        "source met-1: url must be https",
        "source met-1: listed twice",
      ]),
    );
  });

  it("rejects something that isn't a plan", () => {
    expect(validatePlan(null as never)).toEqual(["not a YAML mapping"]);
  });
});

describe("planWarnings", () => {
  it("names every topic without sources, and they don't count as errors", () => {
    const plan = smallPlan();
    expect(validatePlan(plan)).toEqual([]);
    expect(planWarnings(plan)).toEqual([
      "week 1 geography (then): no sources, so its cards are text only",
      "week 1 science (wonder): no sources, so its cards are text only",
      "week 1 music (listen): no sources, so its cards are text only",
      "week 1 literature (then): no sources, so its cards are text only",
      "week 1 math (puzzle): no sources, so its cards are text only",
    ]);
  });

  it("is empty when every topic has a source", () => {
    const plan = smallPlan();
    plan.weeks[0].topics = plan.weeks[0].topics.map((t) => ({ ...t, sources: ["met-1"] }));
    expect(planWarnings(plan)).toEqual([]);
  });

  it("finds nothing missing in the Egypt stretch (decided 15 Oct 2026: every topic gets a picture)", () => {
    const egypt = parsePlan(readFileSync(join(dir, "ancient-egypt.yaml"), "utf8"));
    expect(planWarnings(egypt)).toEqual([]);
  });
});

describe("planRows", () => {
  const rows = planRows(smallPlan());

  it("makes one week row and one row per topic for each grade band, weeks first", () => {
    expect(rows).toHaveLength(2 + 12);
    expect(rows.slice(0, 2).map((r) => r.key)).toEqual(["test/w1/2-3", "test/w1/4-5"]);
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length);
  });

  it("puts the week's why in the week row and hangs topics under their band's week", () => {
    expect(rows[1]).toMatchObject({ subject: "week", slot: null, title: "The river", summary: "Everything starts here.", grade_band: "4-5", parent_key: null });
    const art = rows.find((r) => r.key === "test/w1/art/4-5")!;
    expect(art).toMatchObject({ parent_key: "test/w1/4-5", slot: "look", summary: "Older.", sequence: 2, week: 1 });
    expect(art.sources).toEqual([expect.objectContaining({ id: "met-1", license: "CC0" })]);
  });

  it("carries the week's perspective and values points to every row, and trims the parent note", () => {
    expect(rows.every((r) => r.perspective === "several_fairly" && r.values_points.join() === "12")).toBe(true);
    expect(rows.find((r) => r.key === "test/w1/science/2-3")!.parent_note).toBe("An experiment.");
    expect(rows.find((r) => r.key === "test/w1/math/2-3")!.parent_note).toBeNull();
  });
});
