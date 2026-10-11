import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { entryForLean, parsePack, validatePack, type PackEntry } from "./packs";

const dir = join(__dirname, "..", "packs");
const files = readdirSync(dir).filter((f) => f.endsWith(".yaml"));

describe.each(files)("packs/%s", (file) => {
  const pack = parsePack(readFileSync(join(dir, file), "utf8"));

  it("is valid", () => {
    expect(validatePack(pack)).toEqual([]);
  });

  it("is named after its file", () => {
    expect(`${pack.pack}.yaml`).toBe(file);
  });
});

describe("entryForLean", () => {
  const entry: PackEntry = {
    point: 17,
    when: "anytime",
    from_age: null,
    perspective: "several_fairly",
    position: "base",
    source: "s",
    split: "none",
    handoff: "Ask Mom or Dad.",
    parent_note: "",
    needs_check: false,
    by_lean: { conservative: { perspective: "family_tradition", position: "conservative" } },
  };

  it("applies the lean's override", () => {
    expect(entryForLean(entry, "conservative")).toMatchObject({ perspective: "family_tradition", position: "conservative", handoff: "Ask Mom or Dad." });
  });

  it("falls back to the base entry", () => {
    expect(entryForLean(entry, "progressive")).toMatchObject({ perspective: "several_fairly", position: "base" });
    expect(entryForLean(entry, "unset")).not.toHaveProperty("by_lean");
  });
});
