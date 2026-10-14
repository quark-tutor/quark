import { describe, expect, it } from "vitest";
import { costOf } from "./prices";

describe("costOf", () => {
  it("prices tokens per million, and says nothing about a model it doesn't know", () => {
    expect(costOf("claude-opus-5-5", { input: 1_000_000, output: 100_000 })).toBeCloseTo(6);
    expect(costOf("claude-sonnet-5-5", { input: 500_000, output: 500_000 })).toBeCloseTo(6);
    expect(costOf("some-other-model", { input: 1, output: 1 })).toBeNull();
  });
});
