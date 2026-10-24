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

describe("card.md", () => {
  it("carries card v6's rules: the idea named, never the answer before the question, and no read_aloud", () => {
    const card = kidFacingPrompt("card.md");
    expect(card).toContain("## Name the idea");
    expect(card).toContain("**The title is the idea's name**");
    expect(card).toContain("**The name is never what the question asks for.**");
    expect(card).toContain("## The question comes before the answer");
    expect(card).toContain("never states the answer to its own question");
    expect(card).toContain("**A parent's part, from the first words.**");
    expect(card).toContain("never name it to the child");
    expect(card).not.toMatch(/read.aloud/i);
  });

  it("takes the idea's name from the shared chain, whose title is that name (ideas v5)", () => {
    expect(kidFacingPrompt("card.md")).toContain("as the chain gives it for each layer: use it word for word");
    const ideas = readPrompt("ideas.md");
    expect(ideas).toContain("- **title**: the idea's name");
    expect(ideas).toContain("it never asks for the idea's own name");
  });
});

describe("the gate's prompts", () => {
  it("puts the manner rules before the test run's answer prompt, which a child-facing answer needs", () => {
    const prompt = kidFacingPrompt("answer.md");
    expect(prompt.startsWith("# How you speak to the child")).toBe(true);
    expect(prompt).toContain("# Answer one question a child asked");
  });

  it("reads the gate's own prompt plainly: it writes nothing a child sees", () => {
    const gate = readPrompt("gate.md");
    expect(gate.startsWith("# Check one card before a child could see it")).toBe(true);
    for (const rule of ["parent_led", "perspective", "blocked_topic", "rule_1", "rule_6", "frightening", "caution"]) expect(gate).toContain(`**${rule}**`);
  });
});
