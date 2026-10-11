// Build a single HTML page comparing every pack in packs/, for a family choosing where to start.
//   node scripts/pack-compare.mts <output.html>
// The page embeds the pack data; it needs no server. Points and kid questions come from
// supabase/migrations (the seeded values_points), so they match the app.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const out = process.argv[2];
if (!out) throw new Error("Usage: node scripts/pack-compare.mts <output.html>");

const root = join(import.meta.dirname, "..");
const packDir = join(root, "packs");

// The 24 points, read from the seed in the initial migration.
const seed = readFileSync(join(root, "supabase/migrations/20261010000000_initial_schema.sql"), "utf8");
const points = [...seed.matchAll(/^\s*\((\d+),'((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)'\)/gm)].map((m) => ({
  number: Number(m[1]),
  area: m[2].replace(/''/g, "'"),
  name: m[3].replace(/''/g, "'"),
  question: m[4].replace(/''/g, "'"),
}));
if (points.length !== 24) throw new Error(`Expected 24 points in the seed, found ${points.length}`);

// In the order each pack sets (its order field).
const packs = readdirSync(packDir)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => parse(readFileSync(join(packDir, f), "utf8")))
  .sort((a, b) => a.order - b.order);

const data = JSON.stringify({ points, packs }).replace(/</g, "\\u003c");
const template = readFileSync(join(import.meta.dirname, "pack-compare.template.html"), "utf8");
writeFileSync(out, template.replace("/*__DATA__*/null", data));
console.log(`Wrote ${out}: ${packs.length} packs (${packs.map((p) => p.pack).join(", ")})`);
