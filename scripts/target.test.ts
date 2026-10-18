import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { expectedTarget, LIVE_ENV_FILE, targetProblem } from "./target";

describe("expectedTarget", () => {
  it("is live only when the live env file is loaded", () => {
    expect(expectedTarget(["--env-file=.env.live.local"])).toBe("live");
    expect(expectedTarget(["--env-file=.env.local", "--conditions=react-server"])).toBe("test");
    expect(expectedTarget([])).toBe("test");
  });
});

describe("targetProblem", () => {
  it("lets a script go on when the file and the script agree", () => {
    expect(targetProblem("test", "test")).toBeNull();
    expect(targetProblem("live", "live")).toBeNull();
  });
  it("refuses when QUARK_TARGET is missing or unknown", () => {
    expect(targetProblem("test", undefined)).toMatch(/not set/);
    expect(targetProblem("test", "prod")).toMatch(/"prod"/);
  });
  it("refuses live values in .env.local", () => {
    expect(targetProblem("test", "live")).toMatch(/\.env\.live\.local/);
  });
  it("refuses test values in the live env file", () => {
    expect(targetProblem("live", "test")).toMatch(/live script/);
  });
});

describe("package.json", () => {
  const scripts: Record<string, string> = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ).scripts;

  it("lets only scripts with :live in their name read the live env file", () => {
    for (const [name, command] of Object.entries(scripts)) {
      const readsLive = command.includes(LIVE_ENV_FILE);
      expect(readsLive, name).toBe(name.includes(":live"));
    }
  });
  it("gives every database script a live twin that differs only in the env file", () => {
    for (const [name, command] of Object.entries(scripts)) {
      if (!name.endsWith(":live")) continue;
      const twin = scripts[name.slice(0, -":live".length)];
      expect(twin, `${name} has no test twin`).toBeDefined();
      // seed also swaps which family file it reads
      const strip = (c: string) => c.replace(/--env-file=\S+/, "").replace(/scripts\/family\.\w+\.json/, "");
      expect(strip(command), name).toBe(strip(twin));
    }
  });
  it("points seed at the test family and seed:live at the real one", () => {
    expect(scripts.seed).toContain("scripts/family.test.json");
    expect(scripts["seed:live"]).toContain("scripts/family.local.json");
  });
});
