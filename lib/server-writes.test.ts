import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Only the server writes a week, its verdicts, a child's answers and the audit log
// (docs/wonder-wall-1-slice.md, decision 4). The migration takes the rights from a guardian's session;
// these checks hold that no page still writes audit_log through one, which the migration would break.

const root = fileURLToPath(new URL("../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name === ".next" ? [] : sources(path);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\.ts$/.test(e.name) ? [path] : [];
  });
}

const code = (path: string) =>
  readFileSync(join(root, path), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("audit rows", () => {
  it("are inserted from app/ and lib/ only through the service role", () => {
    const writers: string[] = [];
    for (const path of ["app", "lib"].flatMap(sources)) {
      const text = code(path);
      for (const m of text.matchAll(/([\w.]+(?:\(\))?)\s*\.from\("audit_log"\)\s*\.insert\(/g)) {
        const receiver = m[1];
        const admin = receiver === "createAdminClient()" || new RegExp(`const ${receiver} = createAdminClient\\(\\)`).test(text);
        writers.push(`${relative(".", path).replace(/\\/g, "/")}: ${admin ? "service role" : receiver}`);
      }
    }
    expect(writers.length).toBeGreaterThan(0);
    expect(writers.filter((w) => !w.endsWith("service role"))).toEqual([]);
  });

  it("from the five /parent changes go through lib/audit.ts", () => {
    for (const path of ["app/parent/actions.ts", "app/parent/beliefs/actions.ts", "app/parent/content/actions.ts", "app/parent/beliefs/compare/actions.ts"]) {
      const text = code(path);
      expect(text, path).toContain('from "@/lib/audit"');
      expect(text, path).not.toContain('from("audit_log")');
    }
  });
});

describe("the direct-write migration", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20261021000000_server_writes_weeks.sql"), "utf8")
    .split("\n")
    .filter((l) => !l.startsWith("--"))
    .join(" ");

  it("takes insert and update on the week tables, sessions and attempts, and insert on audit_log, from guardians", () => {
    expect(sql).toMatch(/revoke insert, update on themes, ideas, cards, questions from authenticated;/);
    expect(sql).toMatch(/revoke insert, update on sessions, attempts from authenticated;/);
    expect(sql).toMatch(/revoke insert on audit_log from authenticated;/);
  });

  it("grants nothing", () => {
    expect(sql).not.toMatch(/\bgrant\b/i);
  });
});
