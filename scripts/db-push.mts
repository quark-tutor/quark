// Apply supabase/migrations to the project in SUPABASE_DB_URL.
//   npm run db:push          the test project (.env.local)
//   npm run db:push:live     the LIVE project (.env.live.local); asks first
// The CLI has no environment route for the URL (--db-url is its only way), so the output is
// captured and scrubbed: a failure never prints the connection string or its password.
import { spawnSync } from "node:child_process";
import { scrubUrl } from "./scrub-url.ts";
import { announceTarget } from "./target.ts";

const target = announceTarget();
const envFile = target === "live" ? ".env.live.local" : ".env.local";
const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error(`Set SUPABASE_DB_URL in ${envFile}.`);
try {
  // The pooler's user is postgres.<project ref>: enough to tell the two projects apart, no secret.
  console.log(`Database user: ${new URL(dbUrl).username}`);
} catch {
  // not a parseable URL; the CLI will say so, scrubbed
}
const run = spawnSync("npx", ["supabase", "db", "push", "--db-url", dbUrl, ...process.argv.slice(2)], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
process.stdout.write(scrubUrl(run.stdout ?? "", dbUrl));
process.stderr.write(scrubUrl(run.stderr ?? "", dbUrl));
if (run.error) console.error(scrubUrl(String(run.error.message), dbUrl));
process.exit(run.status ?? 1);
