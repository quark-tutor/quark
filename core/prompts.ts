import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Prompts live in versioned files under core/prompts/, never inline (CLAUDE.md). Anything a child
// will see or hear is built with kidFacingPrompt(), so the manner rules (manner.md) always come
// first. next.config.ts traces core/prompts/ into the server bundle.

const dir = join(process.cwd(), "core", "prompts");

export function readPrompt(name: string): string {
  if (!/^[a-z0-9-]+\.md$/.test(name)) throw new Error(`Bad prompt name: ${name}`);
  // Drop the leading HTML comment: it's a note for people editing the file.
  return readFileSync(join(dir, name), "utf8").replace(/^<!--[\s\S]*?-->\s*/, "").trim();
}

export function kidFacingPrompt(name: string): string {
  return `${readPrompt("manner.md")}\n\n${readPrompt(name)}`;
}
