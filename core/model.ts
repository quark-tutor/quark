import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The thin model adapter (CLAUDE.md). Everything that calls a language model goes through
// complete(), so the provider can be swapped by rewriting this one file. Curation (ideas), writing
// (cards) and the policy gate read their model names from separate env vars so each can run on the
// model that suits it: facts on the strongest, writing on a cheaper one (decided 14 Oct 2026).
//
// Prompt text never lives inline: `system` comes from core/prompts/ via readPrompt() or
// kidFacingPrompt() (core/prompts.ts), and `prompt` carries the data for this one call.

export type ModelUse = "curate" | "write" | "gate";

export type ImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
export const IMAGE_TYPES: readonly ImageType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// An image the model looks at alongside the prompt: a URL it fetches, or bytes we send.
export type ModelImage = { url: string } | { data: Uint8Array; mediaType: ImageType };

const modelEnv: Record<ModelUse, string> = {
  curate: "QUARK_MODEL_CURATE",
  write: "QUARK_MODEL_WRITE",
  gate: "QUARK_MODEL_GATE",
};

export type CompleteOptions = {
  system: string;
  prompt: string;
  maxTokens: number;
  use?: ModelUse; // which env var names the model; defaults to curate
  images?: ModelImage[]; // shown before the prompt
  label?: string; // names the debug file: "ideas-day1-puzzle"
  // This one call's tokens, for a caller that prices it on its own (a server action shares the
  // process with other requests, so usageSoFar() isn't its own).
  onUsage?: (u: { model: string; input: number; output: number }) => void;
};

let client: Anthropic | undefined;

// Tokens used so far in this process, per job and model, so a script can report and record what a
// run cost, and the models page can tell ideas from cards even when both run on one model.
export type Usage = { use: ModelUse; model: string; input: number; output: number; calls: number };
const usage = new Map<string, Usage>();
export const usageSoFar = (): Usage[] => [...usage.values()].map((u) => ({ ...u }));
export const resetUsage = () => usage.clear();

// With a debug folder set, every request and its reply are written there as JSON, one file per
// call, before anything is checked, so a reply that fails can be read as it came back. Image
// bytes are left out.
let debugDir: string | null = null;
let debugCount = 0;
export function debugTo(dir: string | null) {
  debugDir = dir;
  if (dir) mkdirSync(dir, { recursive: true });
}
function writeDebug(label: string | undefined, request: unknown, reply: unknown) {
  if (!debugDir) return;
  const name = `${String(++debugCount).padStart(3, "0")}-${(label ?? "call").replace(/[^a-z0-9-]+/gi, "-")}.json`;
  const scrub = (_k: string, v: unknown) => (typeof v === "string" && v.length > 2000 && /^[A-Za-z0-9+/=]+$/.test(v) ? `<${v.length} base64 chars>` : v);
  writeFileSync(join(debugDir, name), JSON.stringify({ request, reply }, scrub, 2));
}

export function modelFor(use: ModelUse): string {
  const name = process.env[modelEnv[use]];
  if (!name) throw new Error(`Set ${modelEnv[use]} in .env.local (see .env.example).`);
  return name;
}

function imageBlock(image: ModelImage): Anthropic.ImageBlockParam {
  if ("url" in image) return { type: "image", source: { type: "url", url: image.url } };
  return {
    type: "image",
    source: { type: "base64", media_type: image.mediaType, data: Buffer.from(image.data).toString("base64") },
  };
}

// With `json`, a JSON Schema: the reply is constrained to it and returned parsed.
export async function complete(options: CompleteOptions): Promise<string>;
export async function complete<T>(options: CompleteOptions & { json: Record<string, unknown> }): Promise<T>;
export async function complete(options: CompleteOptions & { json?: Record<string, unknown> }): Promise<unknown> {
  const { system, prompt, maxTokens, use = "curate", images = [], json } = options;
  const model = modelFor(use);
  client ??= new Anthropic(); // reads ANTHROPIC_API_KEY

  const content: string | Anthropic.ContentBlockParam[] = images.length
    ? [...images.map(imageBlock), { type: "text", text: prompt }]
    : prompt;
  const request: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
    ...(json && { output_config: { format: { type: "json_schema", schema: json } } }),
  };
  let response: Anthropic.Message;
  try {
    response = await client.messages.create(request);
  } catch (e) {
    writeDebug(options.label, request, { error: e instanceof Error ? e.message : String(e) });
    throw e;
  }
  writeDebug(options.label, request, response);

  const tally = usage.get(`${use} ${model}`) ?? { use, model, input: 0, output: 0, calls: 0 };
  const u = response.usage;
  const input = (u?.input_tokens ?? 0) + (u?.cache_creation_input_tokens ?? 0) + (u?.cache_read_input_tokens ?? 0);
  tally.input += input;
  tally.output += u?.output_tokens ?? 0;
  tally.calls += 1;
  usage.set(`${use} ${model}`, tally);
  options.onUsage?.({ model, input, output: u?.output_tokens ?? 0 });

  if (response.stop_reason === "refusal") {
    throw new Error(`The model declined (${response.stop_details?.category ?? "no category"}).`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error(`The reply hit maxTokens (${maxTokens}) and was cut off.`);
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  return json ? JSON.parse(text) : text;
}
