// Both sides of core/speech.ts against Google, with no one's voice: the tutor says each line as 16 kHz PCM, and
// Chirp 3 hears it back, which shows how the voice read it (a number read as one number comes back as one).
// Each line goes as written, not through the wall's forVoice(), so a shape can be tried both ways.
// Proves the key, both APIs and the request shapes. No database; nothing is kept.
//   npm run speech:check
//   npm run speech:check -- "Any line to say and hear." "Another line."

import { hear, sayWav } from "../core/speech.ts";

const RATE = 16_000;
const lines = process.argv.length > 2 ? process.argv.slice(2) : ["The people far away are painted smaller."];

// Google's WAV has a header; the samples follow the "data" chunk's eight bytes.
function pcmOf(wav: Uint8Array): Uint8Array {
  const text = Buffer.from(wav).toString("latin1");
  const at = text.indexOf("data");
  if (!text.startsWith("RIFF") || at < 0) throw new Error("Google's reply is not a WAV file.");
  return wav.subarray(at + 8);
}

for (const line of lines) {
  const started = Date.now();
  const pcm = pcmOf(await sayWav(line, RATE));
  const said = Date.now();
  const heard = await hear(pcm, { sampleRate: RATE });
  console.log(`Said:  ${line} (${(pcm.length / 2 / RATE).toFixed(1)} s of audio, ${said - started} ms)`);
  console.log(`Heard: ${heard || "(nothing)"} (${Date.now() - said} ms)\n`);
}
