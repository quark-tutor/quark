import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { kidFacingPrompt, readPrompt } = await import("./prompts");

describe("manner.md", () => {
  it("carries every manner rule from docs/12", () => {
    const doc = readFileSync(join(__dirname, "..", "docs", "12-teaching-that-tests-itself.md"), "utf8").replace(/\r\n/g, "\n");
    const section = doc.split("The manner rules")[1].split("\n\n**Why")[0];
    const rules = [...section.matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
    expect(rules).toHaveLength(5);
    const manner = readPrompt("manner.md");
    for (const rule of rules) expect(manner).toContain(`- ${rule}`);
  });

  it("comes first in every kid-facing prompt, without the editors' comment", () => {
    const prompt = kidFacingPrompt("manner.md");
    expect(prompt.startsWith("# How you speak to the child")).toBe(true);
    expect(prompt).not.toContain("<!--");
  });

  it("refuses names outside core/prompts", () => {
    expect(() => readPrompt("../CLAUDE.md")).toThrow();
  });
});
