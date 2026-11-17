import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BRILLIANCE } from "../core/curation/cards.ts";
import { BOAT, MATH_NAME, SAY, SLOT_NAMES } from "../core/wall/words.ts";

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

  it("logs nothing on the kid path but a failed hear's or say's message and why the judge gave no verdict, so no guess, nickname, reply, heard word or line reaches a log", () => {
    const logging = [...KID, "lib/wall.ts", "lib/boat.ts", "lib/speech-ahead.ts", ...sources("core/wall"), ...sources("core/boat")].filter((p) => /\bconsole\./.test(code(p))).map(name);
    expect(logging.sort()).toEqual(["app/api/kid/hear/route.ts", "app/api/kid/say/route.ts", "lib/boat.ts", "lib/wall.ts"]);
    // The trading boat's no-number judge (docs/trading-boat-slice.md): the fault alone, and the database's message.
    expect(code("lib/boat.ts").match(/\bconsole\.[^;]*;/g)).toEqual([
      `console.error("no number: read as other instead:", r.fault);`,
      `console.error("no number: could not record the run:", error.message);`,
    ]);
    expect(code("app/api/kid/hear/route.ts").match(/\bconsole\.[^;]*;/g)).toEqual([
      `console.error("hear: Talk failed", error instanceof Error ? error.message : "unknown error");`,
    ]);
    // The say route's fault is the error's first line with anything quoted taken out (a card's words can hold a nickname).
    expect(code("app/api/kid/say/route.ts").match(/\bconsole\.[^;]*;/g)).toEqual([`console.error("say: Read it to me failed", fault(error));`]);
    expect(code("app/api/kid/say/route.ts")).toContain(`.split("\\n")[0].replace(/"[^"]*"/g, '"…"')`);
    // The judge's fault is the error's first line (core/wall/judge.ts), and a failed record is the database's message.
    expect(code("lib/wall.ts").match(/\bconsole\.[^;]*;/g)).toEqual([
      `console.error("judge: the word rule judged instead:", r.fault);`,
      `console.error("judge: could not record the run:", error.message);`,
    ]);
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
    for (const p of ["core/speech.ts", "core/speech/google.ts", "lib/wall.ts", "lib/boat.ts", "lib/speech-ahead.ts"]) {
      expect(code(p), p).toMatch(/^import "server-only";/);
    }
  });

  it("make lines ahead only from the night's route: nothing on the kid path, and no browser file, imports the firing (docs/lines-ahead-slice.md)", () => {
    const AHEAD = /speech-ahead/;
    const importers = [...sources("app"), ...sources("lib"), ...sources("core")].filter((p) => AHEAD.test(code(p))).map(name);
    expect(importers.sort()).toEqual(["app/api/cron/speech/route.ts", "app/parent/models/page.tsx", "lib/speech-ahead.ts"]);
    expect(KID.filter((p) => AHEAD.test(code(p)))).toEqual([]);
    expect(AHEAD.test(code("lib/wall.ts"))).toBe(false);
  });

  it("say one line at a time, and a recording plays on under the voice by design (Brandon, 8 Nov 2026)", () => {
    const ONE = /one-at-a-time/;
    // Only "Read it to me" takes part; the recording's player never hears it start.
    expect(KID.filter((p) => ONE.test(code(p))).map(name)).toEqual(["app/kid/read-aloud.tsx"]);
  });

  it("stop every sound on a card when the card is left (Brandon, 8 Nov 2026)", () => {
    const sounds = KID.filter((p) => /<audio\b/.test(code(p)));
    expect(sounds.map(name).sort()).toEqual(["app/kid/player.tsx", "app/kid/read-aloud.tsx"]);
    for (const p of sounds) expect(code(p), name(p)).toMatch(/useStopsOnLeave\(audio\)/);
  });

  it("use no browser speech engine anywhere", () => {
    const engines = [...sources("app"), ...sources("core"), ...sources("lib")].filter((p) => /speechSynthesis|SpeechRecognition|SpeechSynthesisUtterance/.test(code(p))).map(name);
    expect(engines).toEqual([]);
  });
});

describe("the wall's own words", () => {
  // The trading boat's sentences (docs/trading-boat-slice.md), each filled in as the game fills it.
  const B = BOAT;
  const boat = [
    B.tile, ...B.firstDay, B.toHarbor, B.toVillage, B.castOff, B.money(20), B.yourBoat("canoe", 3, 10), B.aboard(["3 crates of taro"]), B.aboard([]), B.usual(5),
    B.market("harbor", "home"), B.market("village", "maui"), B.offer("taro", 3), B.left(1), B.left(6), B.soldOut, B.rumor("mangoes", "maui", 10), B.howMany("bananas"),
    B.allTheTraderHas, B.allTheRoom, B.thatMany, B.owe, B.bought(1, "taro"), B.bought(6, "mangoes"), B.short(70, 60), B.chooseAgain, B.added(6, 5), B.oneOut("crate"),
    B.oneOut("bill"), B.letsCount, B.step(4, "crate", false), B.step(1, "crate", true), B.tryFewer, B.tryFewerButton, B.sellFewer, B.sellFewerButton, B.askGrownUp,
    B.whereSail, B.sailChoice("coconuts", "oahu", 10), B.castOffFor("kauai"), B.sailingTo("lanai"), B.land("molokai"), B.landReason("sweet-potatoes", "hawaii", 10),
    B.usualHere("pineapples", 4), B.buyer(6, "taro", 4), B.buyerNext(2, "pineapples", 10), B.buyerLimit, B.howManySell, B.owed, B.sold(120), B.keep, B.backMade(30, "mangoes", 60), B.backLess(30, "taro", 20), B.right,
    B.countUp(30, 60), B.builder("double", 20, 4), B.buyIt, B.notNow, B.oweBuilder, B.bundle, B.boatYours("schooner", 50), MATH_NAME,
  ];
  const all = [...Object.values(SAY).map((s) => (typeof s === "function" ? s("Pip") : s)), ...Object.values(SLOT_NAMES), ...boat];

  it("say what a trading boat line should, word for word", () => {
    expect(B.bought(1, "taro")).toBe("That's right. 1 crate of taro is on your boat.");
    expect(B.landReason("mangoes", "maui", 10)).toBe("A ship full of mangoes sank near Maui. So mangoes sell for $10 a crate here.");
    expect(B.usualHere("taro", 4)).toBe("Here taro sells for the usual $4 a crate.");
    expect(B.backMade(30, "taro", 60)).toBe("You paid $30 for this taro and sold it for $60. How much did you make?");
    expect(B.market("harbor", "home")).toBe("The harbor market at home");
    expect(B.step(1, "crate", false)).toBe("1 crate: how much so far?");
  });

  it("use no brilliance words", () => {
    for (const s of all) expect(s).not.toMatch(BRILLIANCE);
  });

  it("never tell a guess it was wrong", () => {
    for (const s of all) expect(s).not.toMatch(/\b(wrong|not yet|incorrect|no,)\b/i);
  });
});
