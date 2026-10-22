import { pickVoice, type VoiceLike } from "@/core/wall/voice";

// The voices an iPad reports on /kid/voices, printed in the dev server's own output so they can go in a report.
// Voice names only, nothing about a child. Doesn't exist in production.

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const body = (await request.json().catch(() => null)) as { voices?: VoiceLike[] } | null;
  const voices = Array.isArray(body?.voices) ? body.voices.slice(0, 500) : [];
  const picked = pickVoice(voices);
  const lines = voices.map((v) => `  ${v === picked ? "*" : " "} ${v.name} | ${v.lang} | ${v.voiceURI}${v.default ? " | default" : ""}${v.localService ? "" : " | remote"}`);
  console.log(`Voices from ${request.headers.get("user-agent") ?? "a browser"} (${voices.length}; * is the pick):\n${lines.join("\n")}`);
  return new Response(null, { status: 204 });
}
