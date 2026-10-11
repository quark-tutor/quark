// Create (or update) the family, its guardians and its children from a JSON file.
// Guardians get Supabase Auth accounts here, since sign-ups are off in the app.
// Safe to run again: it matches the family by name, guardians by email, children by nickname.
//
//   node --env-file=.env.local scripts/seed-family.ts scripts/family.local.json
//
// Copy scripts/family.example.json to scripts/family.local.json first (it's gitignored).
// Children: nickname, birth month, sex, reading level, interests only. Never a full name,
// photo, school or address.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

type Seed = {
  family: { name: string; timezone?: string };
  guardians: { display_name: string; email: string }[];
  children: {
    nickname: string;
    birth_month: string; // "YYYY-MM"
    sex?: "boy" | "girl";
    reading: "read_to" | "reads_alone" | "chapter_books";
    interests?: string[];
  }[];
};

const file = process.argv[2];
if (!file) throw new Error("Usage: node --env-file=.env.local scripts/seed-family.ts <family.json>");
const seed: Seed = JSON.parse(readFileSync(file, "utf8"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function must<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error || result.data === null) throw new Error(`${what}: ${result.error?.message ?? "no data"}`);
  return result.data;
}

// For writes that return no rows.
function check(result: { error: { message: string } | null }, what: string) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
}

// Family
let family = (await db.from("families").select("id").eq("name", seed.family.name).maybeSingle()).data;
if (!family) {
  family = must(
    await db
      .from("families")
      .insert({ name: seed.family.name, timezone: seed.family.timezone ?? "Pacific/Honolulu" })
      .select("id")
      .single(),
    "create family",
  );
  console.log(`Created family ${seed.family.name}`);
}

// Guardians: an Auth account each, then the guardian row linked to it.
const listed = await db.auth.admin.listUsers({ perPage: 1000 });
check(listed, "list users");
for (const g of seed.guardians) {
  const email = g.email.trim().toLowerCase();
  let user = listed.data.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    const created = await db.auth.admin.createUser({ email, email_confirm: true });
    check(created, `create ${email}`);
    if (!created.data.user) throw new Error(`create ${email}: no user returned`);
    user = created.data.user;
    console.log(`Created sign-in for ${email}`);
  }
  check(
    await db
      .from("guardians")
      .upsert(
        { family_id: family.id, auth_user_id: user.id, display_name: g.display_name, email, active: true },
        { onConflict: "auth_user_id" },
      ),
    `save guardian ${email}`,
  );
  console.log(`Guardian ${g.display_name} <${email}>`);
}

// Children
for (const c of seed.children) {
  if (!/^\d{4}-\d{2}$/.test(c.birth_month)) throw new Error(`${c.nickname}: birth_month must be YYYY-MM`);
  const row = {
    family_id: family.id,
    nickname: c.nickname,
    birth_month: `${c.birth_month}-01`,
    sex: c.sex ?? null,
    reading: c.reading,
    interests: c.interests ?? [],
  };
  const found = await db
    .from("children")
    .select("id")
    .eq("family_id", family.id)
    .eq("nickname", c.nickname)
    .maybeSingle();
  check(found, `find ${c.nickname}`);
  const existing = found.data;
  if (existing) check(await db.from("children").update(row).eq("id", existing.id), `update ${c.nickname}`);
  else check(await db.from("children").insert(row), `create ${c.nickname}`);
  console.log(`Child ${c.nickname}`);
}

console.log("Done.");
