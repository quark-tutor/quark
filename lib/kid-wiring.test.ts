import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BRILLIANCE } from "../core/curation/cards.ts";
import { SAY, SLOT_NAMES } from "../core/wall/words.ts";

// The kid view's wiring (docs/wonder-wall-1-slice.md, decisions 3 to 5): every read and write goes through
// lib/wall.ts (and the device lookup), nothing on the kid path logs anything, nothing links out, and the
// wall's own words are effort words.

const root = fileURLToPath(new URL("../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\.ts$/.test(e.name) ? [path] : [];
  });
}

const code = (path: string) =>
  readFileSync(join(root, path), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const name = (path: string) => relative(".", path).replace(/\\/g, "/");
const KID = ["app/kid", "app/api/kid"].flatMap(sources);

describe("the kid view", () => {
  it("reads and writes the database only through lib/wall.ts and lib/device.ts, apart from pairing", () => {
    const direct = KID.filter((p) => /@\/lib\/supabase\/|\.from\(\s*["']|\.rpc\(/.test(code(p))).map(name);
    expect(direct).toEqual(["app/api/kid/pair/route.ts"]);
  });

  it("logs nothing on the kid path, so no guess, nickname or reply reaches a log", () => {
    const logging = [...KID, "lib/wall.ts", ...sources("core/wall")].filter((p) => /\bconsole\./.test(code(p))).map(name);
    expect(logging).toEqual([]);
  });

  it("has no link out and nothing that plays by itself", () => {
    for (const p of KID) {
      const text = code(p);
      expect(text, name(p)).not.toMatch(/https?:\/\//);
      expect(text, name(p)).not.toMatch(/target=|autoPlay|autoplay/);
    }
  });
});

describe("the tutor's voice and ears (docs/tutor-voice-slice.md)", () => {
  const SPEECH = /core\/speech|core\/wall\/speech|google-auth-library|@\/lib\/wall\b/;

  it("never reach a browser: nothing under app/kid imports the adapter or Google's client", () => {
    const direct = sources("app/kid").filter((p) => /core\/speech|google-auth-library/.test(code(p))).map(name);
    expect(direct).toEqual([]);
  });

  it("are imported by no file a browser loads", () => {
    const client = sources("app").filter((p) => /^\s*["']use client["']/.test(readFileSync(join(root, p), "utf8")));
    expect(client.length).toBeGreaterThan(0);
    expect(client.filter((p) => SPEECH.test(code(p))).map(name)).toEqual([]);
  });

  it("are server-only, so a browser import would stop the build", () => {
    for (const p of ["core/speech.ts", "core/speech/google.ts", "lib/wall.ts"]) {
      expect(code(p), p).toMatch(/^import "server-only";/);
    }
  });

  it("use no browser speech engine anywhere", () => {
    const engines = [...sources("app"), ...sources("core"), ...sources("lib")].filter((p) => /speechSynthesis|SpeechRecognition|SpeechSynthesisUtterance/.test(code(p))).map(name);
    expect(engines).toEqual([]);
  });
});

describe("the wall's own words", () => {
  const all = [...Object.values(SAY).map((s) => (typeof s === "function" ? s("Pip") : s)), ...Object.values(SLOT_NAMES)];

  it("use no brilliance words", () => {
    for (const s of all) expect(s).not.toMatch(BRILLIANCE);
  });

  it("never tell a guess it was wrong", () => {
    for (const s of all) expect(s).not.toMatch(/\b(wrong|not yet|incorrect|no,)\b/i);
  });
});
