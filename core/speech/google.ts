import "server-only";
import { GoogleAuth } from "google-auth-library";

// Google Cloud's speech, behind core/speech.ts: Chirp 3 HD voices say the tutor's lines (Text-to-Speech) and
// Chirp 3 hears the child (Speech-to-Text V2). Chosen for cost (Brandon, 22 Oct 2026): the free tier covers a
// family. Both are plain REST calls with a service account's token, so nothing here needs gRPC.

const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

let auth: GoogleAuth | undefined;

// The service account's key. On the laptop GOOGLE_APPLICATION_CREDENTIALS names its file, kept outside the
// repository; on Vercel, which has no files, GOOGLE_CREDENTIALS_JSON holds the key's JSON itself (so does
// GOOGLE_APPLICATION_CREDENTIALS, if it starts with "{"). The project hear() names is the key's own: given only
// the JSON, the library looks for it in a key file, gcloud and Google's metadata server, and on Vercel finds
// none, so every Talk failed there (26 Oct 2026) while "Read it to me", which names no project, worked.
function googleAuth(): GoogleAuth {
  if (auth) return auth;
  const named = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const json = process.env.GOOGLE_CREDENTIALS_JSON?.trim() || (named?.startsWith("{") ? named : undefined);
  if (json) {
    const credentials = JSON.parse(json);
    auth = new GoogleAuth({ credentials, projectId: credentials.project_id, scopes: SCOPE });
  }
  else if (named) auth = new GoogleAuth({ keyFile: named, scopes: SCOPE });
  else throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS in .env.local (see .env.example).");
  return auth;
}

async function post<T>(url: string, data: unknown): Promise<T> {
  const client = await googleAuth().getClient();
  const res = await client.request<T>({ url, method: "POST", data });
  return res.data;
}

// "en-US-Chirp3-HD-Aoede" speaks en-US.
const languageOf = (voice: string) => voice.split("-").slice(0, 2).join("-");

// MP3, or 16-bit PCM in a WAV file at the rate asked for.
export async function say(text: string, voice: string, format: { wav?: number } = {}): Promise<Uint8Array> {
  const reply = await post<{ audioContent: string }>("https://texttospeech.googleapis.com/v1/text:synthesize", {
    input: { text },
    voice: { languageCode: languageOf(voice), name: voice },
    audioConfig: format.wav ? { audioEncoding: "LINEAR16", sampleRateHertz: format.wav } : { audioEncoding: "MP3" },
  });
  return Buffer.from(reply.audioContent, "base64");
}

// Chirp 3 runs in the "us" multi-region, on its own endpoint. The recognizer "_" is the default one, so
// nothing is set up in the Google project beyond the API. Nothing is sent with the clip but its format: no
// phrases to listen for (a card's answers would pull what is heard toward the right one, rule 3) and nothing
// about the child (rule 7). Speech-to-Text keeps no audio or transcript unless a project joins Google's
// data-logging program, and Quark's does not.
const REGION = "us";
export const HEAR_MODEL = "chirp_3";

type Recognized = { results?: { alternatives?: { transcript?: string }[] }[] };

// The words in one clip of 16-bit mono PCM (one request, under a minute of audio).
export async function hear(pcm: Uint8Array, options: { language: string; sampleRate: number }): Promise<string> {
  const project = await googleAuth().getProjectId();
  const reply = await post<Recognized>(
    `https://${REGION}-speech.googleapis.com/v2/projects/${project}/locations/${REGION}/recognizers/_:recognize`,
    {
      config: {
        model: HEAR_MODEL,
        languageCodes: [options.language],
        explicitDecodingConfig: { encoding: "LINEAR16", sampleRateHertz: options.sampleRate, audioChannelCount: 1 },
        features: { enableAutomaticPunctuation: true },
      },
      content: Buffer.from(pcm).toString("base64"),
    },
  );
  return (reply.results ?? [])
    .map((r) => r.alternatives?.[0]?.transcript?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}
