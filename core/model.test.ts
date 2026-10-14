import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));
const { complete, modelFor } = await import("./model");

function reply(text: string, stop_reason = "end_turn") {
  return { content: [{ type: "text", text }], stop_reason, stop_details: null };
}

beforeEach(() => {
  vi.stubEnv("QUARK_MODEL_CURATE", "curate-model");
  vi.stubEnv("QUARK_MODEL_GATE", "gate-model");
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
