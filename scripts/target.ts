// Which database a script is about to touch, and a refusal when the env file and the script disagree.
// A script run with --env-file=.env.live.local is a live script; any other is a test script.
// Each env file carries QUARK_TARGET=test or QUARK_TARGET=live, so live values pasted into
// .env.local (or test values into .env.live.local) stop here instead of reaching the wrong project.
export const LIVE_ENV_FILE = ".env.live.local";

export type Target = "test" | "live";

export function expectedTarget(execArgv: string[]): Target {
  return execArgv.includes(`--env-file=${LIVE_ENV_FILE}`) ? "live" : "test";
}

// null when the script may go on; otherwise the plain-words reason it must not.
export function targetProblem(expected: Target, declared: string | undefined): string | null {
  if (declared !== "test" && declared !== "live") {
    return `QUARK_TARGET is ${declared ? `"${declared}"` : "not set"}; set it to test or live in the env file (see .env.example).`;
  }
  if (declared !== expected) {
    return expected === "live"
      ? `This is a live script but QUARK_TARGET in ${LIVE_ENV_FILE} says ${declared}.`
      : "This script reads .env.local, which says QUARK_TARGET=live. Live values belong in .env.live.local; use the :live script.";
  }
  return null;
}

// Print the target first, in words a person can check against the ask, then refuse on a mismatch.
export function announceTarget(): Target {
  const expected = expectedTarget(process.execArgv);
  let host = "(no Supabase URL set)";
  try {
    host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    // the script's own check names the missing URL
  }
  console.log(`Target: ${expected === "live" ? "LIVE" : "test"} (${host})`);
  const problem = targetProblem(expected, process.env.QUARK_TARGET);
  if (problem) throw new Error(problem);
  return expected;
}
