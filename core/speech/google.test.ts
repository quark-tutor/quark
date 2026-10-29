import { GoogleAuth } from "google-auth-library";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("hear() on Vercel, with the key only as JSON", () => {
  it("names the key's own project, without looking for a key file, gcloud or a metadata server", async () => {
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "");
    vi.stubEnv("GCLOUD_PROJECT", "");
    vi.stubEnv(
      "GOOGLE_CREDENTIALS_JSON",
      JSON.stringify({ type: "service_account", project_id: "quark-speech", client_email: "x@quark-speech.iam.gserviceaccount.com", private_key: "unused" }),
    );
    const urls: string[] = [];
    vi.spyOn(GoogleAuth.prototype, "getClient").mockResolvedValue({
      request: async ({ url }: { url: string }) => {
        urls.push(url);
        return { data: { results: [{ alternatives: [{ transcript: " the background " }] }] } };
      },
    } as never);

    const { hear } = await import("./google");
    expect(await hear(new Uint8Array(3200), { language: "en-US", sampleRate: 16000 })).toBe("the background");
    expect(urls).toEqual(["https://us-speech.googleapis.com/v2/projects/quark-speech/locations/us/recognizers/_:recognize"]);
  });

  it("says a broken key is not valid JSON without quoting any of it, since the hear route logs the message", async () => {
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "");
    vi.stubEnv("GOOGLE_CREDENTIALS_JSON", '{"private_key": "-----BEGIN PRIVATE KEY-----secret"');
    const { hear } = await import("./google");
    await expect(hear(new Uint8Array(3200), { language: "en-US", sampleRate: 16000 })).rejects.toThrow(
      /^GOOGLE_CREDENTIALS_JSON is not valid JSON\.$/,
    );
  });
});
