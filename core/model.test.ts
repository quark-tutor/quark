import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));
const { complete, debugTo, modelFor, resetUsage, usageSoFar } = await import("./model");

function reply(text: string, stop_reason = "end_turn") {
  return { content: [{ type: "text", text }], stop_reason, stop_details: null };
}

beforeEach(() => {
  vi.stubEnv("QUARK_MODEL_CURATE", "curate-model");
  vi.stubEnv("QUARK_MODEL_GATE", "gate-model");
  vi.stubEnv("QUARK_MODEL_WRITE", "write-model");
  create.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("complete", () => {
  it("sends the system prompt, the prompt and maxTokens to the curation model", async () => {
    create.mockResolvedValue(reply("Hello."));
    const text = await complete({ system: "sys", prompt: "hi", maxTokens: 100 });
    expect(text).toBe("Hello.");
    expect(create).toHaveBeenCalledWith({
      model: "curate-model",
      max_tokens: 100,
      system: "sys",
      messages: [{ role: "user", content: "hi" }],
    });
  });

  it("uses the gate model when asked", async () => {
    create.mockResolvedValue(reply("ok"));
    await complete({ system: "sys", prompt: "hi", maxTokens: 100, use: "gate" });
    expect(create.mock.calls[0][0].model).toBe("gate-model");
  });

  it("constrains the reply to a schema and parses it", async () => {
    create.mockResolvedValue(reply('{"passed":true}'));
    const schema = { type: "object", properties: { passed: { type: "boolean" } } };
    const out = await complete<{ passed: boolean }>({ system: "s", prompt: "p", maxTokens: 50, json: schema });
    expect(out).toEqual({ passed: true });
    expect(create.mock.calls[0][0].output_config).toEqual({ format: { type: "json_schema", schema } });
  });

  it("joins text blocks and skips the rest", async () => {
    create.mockResolvedValue({
      content: [{ type: "thinking", thinking: "" }, { type: "text", text: "a" }, { type: "text", text: "b" }],
      stop_reason: "end_turn",
    });
    expect(await complete({ system: "s", prompt: "p", maxTokens: 10 })).toBe("ab");
  });

  it("throws on a refusal or a cut-off reply rather than returning half an answer", async () => {
    create.mockResolvedValue({ ...reply(""), stop_reason: "refusal", stop_details: { category: "cyber" } });
    await expect(complete({ system: "s", prompt: "p", maxTokens: 10 })).rejects.toThrow(/declined \(cyber\)/);
    create.mockResolvedValue(reply("half", "max_tokens"));
    await expect(complete({ system: "s", prompt: "p", maxTokens: 10 })).rejects.toThrow(/cut off/);
  });

  it("says which env var is missing", async () => {
    vi.stubEnv("QUARK_MODEL_GATE", "");
    expect(() => modelFor("gate")).toThrow(/QUARK_MODEL_GATE/);
    await expect(complete({ system: "s", prompt: "p", maxTokens: 10, use: "gate" })).rejects.toThrow(/QUARK_MODEL_GATE/);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("complete with images", () => {
  it("puts URL and byte images before the prompt", async () => {
    create.mockResolvedValue(reply("A cat."));
    await complete({
      system: "s",
      prompt: "What is it?",
      maxTokens: 50,
      images: [{ url: "https://example.org/cat.jpg" }, { data: new Uint8Array([1, 2, 3]), mediaType: "image/png" }],
    });
    expect(create.mock.calls[0][0].messages[0].content).toEqual([
      { type: "image", source: { type: "url", url: "https://example.org/cat.jpg" } },
      { type: "image", source: { type: "base64", media_type: "image/png", data: "AQID" } },
      { type: "text", text: "What is it?" },
    ]);
  });

  it("sends a plain string when there are no images", async () => {
    create.mockResolvedValue(reply("ok"));
    await complete({ system: "s", prompt: "p", maxTokens: 10, images: [] });
    expect(create.mock.calls[0][0].messages[0].content).toBe("p");
  });
});

describe("usage", () => {
  it("counts tokens per job and model, cache included, and reads the write model", async () => {
    resetUsage();
    const usage = { input_tokens: 100, cache_creation_input_tokens: 20, cache_read_input_tokens: 5, output_tokens: 300 };
    create.mockResolvedValue({ ...reply("ok"), usage });
    await complete({ system: "s", prompt: "p", maxTokens: 10, use: "write" });
    await complete({ system: "s", prompt: "p", maxTokens: 10, use: "write" });
    await complete({ system: "s", prompt: "p", maxTokens: 10 });
    expect(create.mock.calls[0][0].model).toBe("write-model");
    expect(usageSoFar()).toEqual([
      { use: "write", model: "write-model", input: 250, output: 600, calls: 2 },
      { use: "curate", model: "curate-model", input: 125, output: 300, calls: 1 },
    ]);
  });
});

describe("debugTo", () => {
  it("writes each request and reply, without image bytes, and still when the reply is refused", async () => {
    const { mkdtempSync, readdirSync, readFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "quark-debug-"));
    debugTo(dir);
    create.mockResolvedValueOnce(reply("A cat."));
    await complete({ system: "s", prompt: "p", maxTokens: 10, label: "flag one/item", images: [{ data: new Uint8Array(3000), mediaType: "image/png" }] });
    create.mockResolvedValueOnce({ ...reply(""), stop_reason: "refusal", stop_details: { category: "cyber" } });
    await expect(complete({ system: "s", prompt: "p", maxTokens: 10, label: "second" })).rejects.toThrow(/declined/);
    debugTo(null);
    const files = readdirSync(dir).sort();
    expect(files).toEqual(["001-flag-one-item.json", "002-second.json"]);
    const first = JSON.parse(readFileSync(join(dir, files[0]), "utf8"));
    expect(first.request.messages[0].content[0].source.data).toBe("<4000 base64 chars>");
    expect(first.reply.content[0].text).toBe("A cat.");
    expect(JSON.parse(readFileSync(join(dir, files[1]), "utf8")).reply.stop_reason).toBe("refusal");
  });
});
