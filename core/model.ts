import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// The thin model adapter (CLAUDE.md). Everything that calls a language model goes through
// complete(), so the provider can be swapped by rewriting this one file. Curation and the policy
// gate read their model names from separate env vars so they can run on different models.
//
// Prompt text never lives inline: `system` comes from core/prompts/ via readPrompt() or
// kidFacingPrompt() (core/prompts.ts), and `prompt` carries the data for this one call.

export type ModelUse = "curate" | "gate";

export type ImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
export const IMAGE_TYPES: readonly ImageType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// An image the model looks at alongside the prompt: a URL it fetches, or bytes we send.
export type ModelImage = { url: string } | { data: Uint8Array; mediaType: ImageType };

const modelEnv: Record<ModelUse, string> = {
  curate: "QUARK_MODEL_CURATE",
  gate: "QUARK_MODEL_GATE",
};

export type CompleteOptions = {
  system: string;
  prompt: string;
  maxTokens: number;
  use?: ModelUse; // which env var names the model; defaults to curate
  images?: ModelImage[]; // shown before the prompt
};

let client: Anthropic | undefined;

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
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
    ...(json && { output_config: { format: { type: "json_schema", schema: json } } }),
  });

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
