// One card's line said through the wall's own code, as a tap on the child's paired iPad would say it, then heard
// back by Chirp 3 to show how the voice read it. On TEST only (.env.local): the line is stored and a speech run
// recorded, as a tap does, so the iPad's next tap plays this one.
//   npm run speech:line -- <card id> [read|question|handoff|hint.N]

import { hear, sayWav } from "@/core/speech";
import { forVoice, lineText, parseLine } from "@/core/wall/speech";
import { sayLine, wallStore } from "@/lib/wall";
import { createAdminClient } from "@/lib/supabase/admin";
import { announceTarget } from "./target.ts";

announceTarget();
const [cardId, part = "read"] = process.argv.slice(2);
const line = parseLine(`${cardId}.${part}`);
if (!line || !("cardId" in line)) throw new Error("Say which card and part: npm run speech:line -- <card id> [read|question|handoff|hint.N]");

// The child's own paired iPad, so the line is the one that iPad may hear now and nothing else.
const db = createAdminClient();
const card = (await db.from("cards").select("child_id").eq("id", cardId).single()).data as { child_id: string } | null;
if (!card) throw new Error("No such card.");
const found = (await db.from("devices").select("id, family_id, child_id").eq("child_id", card.child_id).is("revoked_at", null).limit(1).maybeSingle()).data as {
  id: string;
  family_id: string;
  child_id: string;
} | null;
if (!found) throw new Error("That card's child has no paired iPad.");
const device = { id: found.id, familyId: found.family_id, childId: found.child_id, nickname: "" };

const now = new Date();
const url = await sayLine(device, `${cardId}.${part}`, now);
if (!url) throw new Error("Refused: the child can't see that line now.");
const words = (await lineText(wallStore(), { familyId: device.familyId, childId: device.childId, deviceId: device.id }, line, now))!.trim();
const sent = forVoice(words);

// The same words in the same voice as 16 kHz PCM, which Chirp 3 can hear; the stored MP3 is read the same way.
const wav = await sayWav(sent, 16_000);
const at = Buffer.from(wav).toString("latin1").indexOf("data");
console.log(`Stored: yes, the iPad's next tap plays it.\nSent:   ${sent}\nHeard:  ${await hear(wav.subarray(at + 8), { sampleRate: 16_000 })}`);
