import "server-only";
import type { AnswerKey } from "@/core/curation/types";
import type { MatchRule } from "@/core/wall/answer";
import type { AttemptRow } from "@/core/wall/card";
import { answer, cardFor, wallFor, type CardRow, type Scope } from "@/core/wall/flow";
import { CLIP_RATE, heardText, parseLine, spokenUrl, type SpeechStore } from "@/core/wall/speech";
import { hear, HEAR_MODEL, say, TUTOR_VOICE } from "@/core/speech";
import type { Device } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

// Every read and write the kid view makes (docs/wonder-wall-1-slice.md, decision 4). It always starts from
// getDevice(): the device cookie resolved to one child, and the service-role client scoped here, in code, to
// that child and that child's family. The steps and the rule are in core/wall/flow.ts, which checks every row
// again after the query. Nothing here logs a guess, a nickname or a reply.

// "every" as briefed, until Brandon chooses at the iPad stop (21 Oct 2026); core/wall/answer.ts has "any".
export const WALL_RULE: MatchRule = "every";

const SIGNED_FOR = 60 * 60; // a signed URL lasts an hour, as on the week page

type Raw = {
  id: string;
  family_id: string;
  child_id: string;
  day: string;
  slot: string;
  layer: number;
  policy: string;
  body: CardRow["body"];
  themes: { status: string; family_id: string } | null;
  ideas: {
    content_item_id: string | null;
    content_items: {
      type: string;
      title: string | null;
      creator: string | null;
      url: string;
      license: string;
      attribution: string | null;
      approved: boolean;
      metadata: { storage_path?: string; date?: string } | null;
      content_sources: { name: string } | null;
    } | null;
  } | null;
  questions: { id: string; prompt: string; answer_key: AnswerKey }[];
};

const COLUMNS =
  "id, family_id, child_id, day, slot, layer, policy, body, themes!inner(status, family_id), " +
  "ideas!inner(content_item_id, content_items(type, title, creator, url, license, attribution, approved, metadata, content_sources(name))), " +
  "questions(id, prompt, answer_key)";

function toRow(r: Raw): CardRow {
  const item = r.ideas?.content_items ?? null;
  return {
    id: r.id,
    family_id: r.family_id,
    child_id: r.child_id,
    day: r.day,
    slot: r.slot,
    layer: r.layer,
    policy: r.policy,
    body: r.body,
    theme: r.themes,
    itemId: r.ideas?.content_item_id ?? null,
    item: item
      ? {
          type: item.type,
          title: item.title,
          creator: item.creator,
          url: item.url,
          license: item.license,
          attribution: item.attribution,
          approved: item.approved,
          date: item.metadata?.date ?? null,
          source: item.content_sources?.name ?? null,
          storagePath: item.metadata?.storage_path ?? null,
        }
      : null,
    question: r.questions?.[0] ?? null,
  };
}

function must<T>(r: { data: T | null; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data as T;
}

// The store, on the service role. The rule's query: this family's and this child's cards for today, passed,
// in a theme of this family that is live. core/wall/flow.ts checks each row again, and the item's approval.
export function wallStore(): SpeechStore {
  const db = createAdminClient();
  const scoped = (familyId: string, childId: string) =>
    db
      .from("cards")
      .select(COLUMNS)
      .eq("family_id", familyId)
      .eq("child_id", childId)
      .eq("policy", "passed")
      .eq("themes.status", "live")
      .eq("themes.family_id", familyId);
  return {
    async timezone(familyId) {
      return (must(await db.from("families").select("timezone").eq("id", familyId).single(), "families") as { timezone: string }).timezone;
    },
    async cards({ familyId, childId, day, slot }) {
      let q = scoped(familyId, childId).eq("day", day);
      if (slot) q = q.eq("slot", slot);
      const rows = must(await q.order("layer").order("created_at").returns<Raw[]>(), "cards");
      return rows.map(toRow);
    },
    async cardById({ familyId, childId, id }) {
      const rows = must(await scoped(familyId, childId).eq("id", id).returns<Raw[]>(), "cards");
      return rows[0] ? toRow(rows[0]) : null;
    },
    async attempts(childId, questionIds) {
      if (!questionIds.length) return [];
      return must(
        await db.from("attempts").select("question_id, correct, created_at").eq("child_id", childId).in("question_id", questionIds).returns<AttemptRow[]>(),
        "attempts",
      );
    },
    async lastSession(childId) {
      const r = await db.from("sessions").select("id, started_at, ended_at, ended_reason").eq("child_id", childId).order("started_at", { ascending: false }).limit(1).maybeSingle();
      if (r.error) throw new Error(`sessions: ${r.error.message}`);
      return r.data;
    },
    async startSession(row) {
      return (must(await db.from("sessions").insert(row).select("id").single(), "sessions") as { id: string }).id;
    },
    async endSession(id, reason) {
      must(await db.from("sessions").update({ ended_reason: reason }).eq("id", id), "sessions");
    },
    async touchSession(id, at) {
      must(await db.from("sessions").update({ ended_at: at }).eq("id", id), "sessions");
    },
    async addAttempt(row) {
      must(await db.from("attempts").insert(row), "attempts");
    },
    async sign(path) {
      const { data, error } = await db.storage.from("content").createSignedUrl(path, SIGNED_FOR);
      return error ? null : data.signedUrl;
    },
    // The tutor's spoken lines sit beside the pictures in the private bucket. Signing a file that isn't there
    // fails, which is how a line not yet made is found.
    async speechUrl(path) {
      const { data, error } = await db.storage.from("content").createSignedUrl(path, SIGNED_FOR);
      return error ? null : data.signedUrl;
    },
    async putSpeech(path, audio) {
      const { error } = await db.storage.from("content").upload(path, audio, { contentType: "audio/mpeg", upsert: true });
      if (error) throw new Error(`speech: ${error.message}`);
    },
    async addSpeechRun(row) {
      must(await db.from("speech_runs").insert(row), "speech_runs");
    },
  };
}

const scopeOf = (device: Device): Scope => ({ familyId: device.familyId, childId: device.childId, deviceId: device.id });

export const loadWall = (device: Device, now = new Date()) => wallFor(wallStore(), scopeOf(device), device.nickname, now);
export const loadCard = (device: Device, cardId: string, now = new Date()) => cardFor(wallStore(), scopeOf(device), cardId, now);
// "Read it to me": a signed URL to the line's audio in the tutor's voice, made on the first tap and stored; null
// when the line isn't one the child can see now (core/wall/speech.ts).
export const sayLine = (device: Device, line: string, now = new Date()) => {
  const parsed = parseLine(line);
  return parsed ? spokenUrl(wallStore(), scopeOf(device), parsed, now, { name: TUTOR_VOICE, say: (text) => say(text) }) : Promise.resolve(null);
};

// Talk: the words in the clip the child said, handed back for the answer box. Neither is kept.
export const hearClip = (device: Device, pcm: Uint8Array) =>
  heardText(wallStore(), scopeOf(device), pcm, { model: HEAR_MODEL, hear: (clip) => hear(clip, { sampleRate: CLIP_RATE }) });

export const sendAnswer = (device: Device, input: { cardId: string; guess: string; seconds: number | null }, now = new Date()) =>
  answer(wallStore(), scopeOf(device), input, now, WALL_RULE);
