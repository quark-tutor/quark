// Apply supabase/migrations to the project in SUPABASE_DB_URL.
//   npm run db:push
import { execFileSync } from "node:child_process";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error("Set SUPABASE_DB_URL in .env.local.");
execFileSync("npx", ["supabase", "db", "push", "--db-url", dbUrl, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
