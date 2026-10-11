// Load packs/*.yaml into values_packs and values_pack_entries, the app's copy of the packs.
//   npm run packs:import
// Safe to run again: packs are matched by slug and their entries replaced.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { entryForLean, LEANS, parsePack, validatePack, type Lean } from "../lib/packs.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const dir = join(import.meta.dirname, "..", "packs");
const packs = readdirSync(dir)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => {
    const pack = parsePack(readFileSync(join(dir, f), "utf8"));
    const errors = validatePack(pack);
    if (errors.length) throw new Error(`packs/${f}:\n  ${errors.join("\n  ")}`);
    return pack;
  });

for (const pack of packs) {
  const { data, error } = await db
    .from("values_packs")
    .upsert(
      {
        slug: pack.pack,
        name: pack.name,
        short_name: pack.short_name,
        subtitle: pack.subtitle || null,
        sort_order: pack.order,
        status: pack.status === "community-reviewed" ? "community_reviewed" : "draft_by_outsiders",
        label: pack.label,
        summary: pack.summary.trim(),
        sources: pack.sources,
        version: pack.version,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`${pack.pack}: ${error.message}`);

  const rows = pack.entries.flatMap((entry) => {
    const leans: (Lean | "unset")[] = ["unset", ...LEANS.filter((lean) => entry.by_lean?.[lean])];
    return leans.map((lean) => {
      const e = entryForLean(entry, lean);
      return {
        pack_id: data.id,
        point_number: entry.point,
        lean,
        when_setting: e.when,
        from_age: e.when === "from_age" ? e.from_age : null,
        perspective: e.perspective,
        position: e.position.trim(),
        source: e.source,
        split: e.split,
        handoff: e.handoff,
        parent_note: e.parent_note?.trim() || null,
        needs_check: entry.needs_check,
      };
    });
  });

  const cleared = await db.from("values_pack_entries").delete().eq("pack_id", data.id);
  if (cleared.error) throw new Error(`${pack.pack}: ${cleared.error.message}`);
  const inserted = await db.from("values_pack_entries").insert(rows);
  if (inserted.error) throw new Error(`${pack.pack}: ${inserted.error.message}`);
  console.log(`${pack.short_name}: ${rows.length} entries`);
}
console.log(`Imported ${packs.length} packs.`);
