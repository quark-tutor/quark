import "server-only";
import { after } from "next/server";
import type { AnswerKey } from "@/core/curation/types";
import { complete } from "@/core/model";
import { readPrompt } from "@/core/prompts";
import { runRow } from "@/core/runs";
import type { MatchRule } from "@/core/wall/answer";
import type { AttemptRow } from "@/core/wall/card";
import { answer, cardFor, wallFor, type CardRow, type Judge, type Scope } from "@/core/wall/flow";
import { JUDGE_MAX_TOKENS, JUDGE_MODEL, JUDGE_SCHEMA, judgeAnswer } from "@/core/wall/judge";
import { CLIP_RATE, heardText, parseLine, spokenUrl, type SpeechStore } from "@/core/wall/speech";
import { hear, HEAR_MODEL, say, TUTOR_VOICE } from "@/core/speech";
import type { Device } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

// Every read and write the kid view makes (docs/wonder-wall-1-slice.md, decision 4). It always starts from
// getDevice(): the device cookie resolved to one child, and the service-role client scoped here, in code, to
// that child and that child's family. The steps and the rule are in core/wall/flow.ts, which checks every row
// again after the query. Nothing here logs a guess, a nickname or a reply; when the judge gives no verdict, one
// line says why, the error's message alone.

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
  level: string | null;
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
  "id, family_id, child_id, day, slot, layer, policy, level, body, themes!inner(status, family_id), " +
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
    level: r.level,
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
        await db.from("attempts").select("question_id, correct, verdict, created_at").eq("child_id", childId).in("question_id", questionIds).returns<AttemptRow[]>(),
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

let judgePrompt: string | undefined;

// The judge for this iPad's child (core/wall/judge.ts): the nickname is given only to be taken out of what is sent.
// What it spent is written to model_runs after the reply has gone (counts and money only), so the child never
// waits on it; the parents read it on /parent/models.
function judgeFor(device: Device): Judge {
  return async (input) => {
    judgePrompt ??= readPrompt("judge.md");
    const spent = { input: 0, output: 0, calls: 0 };
    const startedAt = new Date();
    const r = await judgeAnswer({ ...input, nickname: device.nickname }, ({ prompt, timeoutMs }) =>
      complete({
        system: judgePrompt!,
        prompt,
        maxTokens: JUDGE_MAX_TOKENS,
        use: "judge",
        model: JUDGE_MODEL,
        json: JUDGE_SCHEMA,
        timeoutMs,
        onUsage: (u) => {
          spent.input += u.input;
          spent.output += u.output;
          spent.calls += 1;
        },
      }),
    );
    if (!r.judgement) console.error("judge: the word rule judged instead:", r.fault);
    // A row for every answer sent, so the page counts the ones the word rule judged too (ok false); a call that
    // timed out reports no tokens.
    after(async () => {
      const row = runRow("judge", [{ use: "judge", model: JUDGE_MODEL, ...spent }], { ok: !!r.judgement, startedAt });
      const { error } = await createAdminClient().from("model_runs").insert({ family_id: device.familyId, ...row });
      if (error) console.error("judge: could not record the run:", error.message);
    });
    return r.judgement;
  };
}

// A guess, judged by the model, or by the word rule when the model gives no verdict in time.
export const sendAnswer = (device: Device, input: { cardId: string; guess: string; seconds: number | null }, now = new Date()) =>
  answer(wallStore(), scopeOf(device), input, now, WALL_RULE, judgeFor(device));
