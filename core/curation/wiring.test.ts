import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// One copy of the week-build wiring (docs/looks-good-slice.md, decision 2): the script, the Sunday route
// and the pages reach buildWeek() and runGate() only through core/curation/week-job.ts and
// core/curation/gate-run.ts, so what the script does and what the route does cannot drift apart.

const root = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name === ".next" ? [] : sources(path);
    return /\.(ts|tsx|mts)$/.test(e.name) && !/\.test\.ts$/.test(e.name) ? [path] : [];
  });
}

// The code of a file with its comments taken out, so a comment that names a function isn't a call.
const code = (path: string) =>
  readFileSync(join(root, path), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

function callers(fn: string): string[] {
  const call = new RegExp(`\\b${fn}\\s*\\(`);
  return ["scripts", "app", "core", "lib"]
    .flatMap(sources)
    .filter((path) => call.test(code(path)))
    .map((path) => relative(".", path).replace(/\\/g, "/"))
    .sort();
}

describe("the week-build wiring", () => {
  it("calls buildWeek() only from its definition and week-job.ts", () => {
    expect(callers("buildWeek")).toEqual(["core/curation/week-job.ts", "core/curation/week.ts"]);
  });

  it("calls runGate() only from its definition and gate-run.ts", () => {
    expect(callers("runGate")).toEqual(["core/curation/gate-run.ts", "core/curation/gate.ts"]);
  });
});
