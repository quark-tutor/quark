// One card's words read by several voices, as MP3 files, so the parents can hear them side by side and pick
// the tutor's voice (docs/tutor-voice-slice.md, stop 1). For quark-test only: it reads one card from the test
// database, sends its words to Google through core/speech.ts, and writes the files to docs/reports/samples/.
// Nothing is stored in the database and nothing reaches a child.
//   npm run speech:samples -- "<the card's first words>" <voice> [<voice> ...]
//   npm run speech:samples -- "In 1565, Pieter Bruegel" en-US-Chirp3-HD-Aoede en-US-Chirp3-HD-Charon

import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { say } from "../core/speech.ts";
import { announceTarget } from "./target.ts";

announceTarget();
const [start, ...voices] = process.argv.slice(2);
if (!start || voices.length === 0) throw new Error('Say the card\'s first words and the voices: npm run speech:samples -- "In 1565" en-US-Chirp3-HD-Aoede');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data, error } = await db
  .from("cards")
  .select("id, created_at, body")
  .like("body->>text", `${start.replace(/[%_]/g, "\\$&")}%`)
  .order("created_at")
  .returns<{ id: string; created_at: string; body: { text: string } }[]>();
if (error) throw new Error(`cards: ${error.message}`);
if (!data?.length) throw new Error(`No card on test starts "${start}".`);
const text = data[0].body.text;
console.log(`${data.length} card${data.length === 1 ? "" : "s"} start that way; reading the first made (${text.length} characters):\n${text}\n`);

const out = new URL("../docs/reports/samples/", import.meta.url);
mkdirSync(out, { recursive: true });
for (const voice of voices) {
  const audio = await say(text, { voice });
  const file = new URL(`${voice}.mp3`, out);
  writeFileSync(file, audio);
  console.log(`${voice}: ${Math.round(audio.length / 1024)} KB, docs/reports/samples/${voice}.mp3`);
}
console.log(`Sent ${text.length * voices.length} characters to Google.`);
