// Apply supabase/migrations to the project in SUPABASE_DB_URL.
//   npm run db:push
// The CLI has no environment route for the URL (--db-url is its only way), so the output is
// captured and scrubbed: a failure never prints the connection string or its password.
import { spawnSync } from "node:child_process";
import { scrubUrl } from "./scrub-url";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error("Set SUPABASE_DB_URL in .env.local.");
const run = spawnSync("npx", ["supabase", "db", "push", "--db-url", dbUrl, ...process.argv.slice(2)], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
process.stdout.write(scrubUrl(run.stdout ?? "", dbUrl));
process.stderr.write(scrubUrl(run.stderr ?? "", dbUrl));
if (run.error) console.error(scrubUrl(String(run.error.message), dbUrl));
process.exit(run.status ?? 1);
