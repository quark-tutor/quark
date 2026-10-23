import "server-only";
import * as google from "./speech/google.ts";

// The thin speech adapter, shaped like core/model.ts. Everything the tutor says (text to speech) and everything
// a child says to it (speech to text) goes through say() and hear(), so the vendor can be swapped by rewriting
// core/speech/google.ts. One vendor for both sides, so a child hears one tutor, and never the browser's own
// engines (Brandon, 22 Oct 2026: "control it all in one spot"). The key is read on the server only; nothing a
// browser loads imports this file (lib/kid-wiring.test.ts), so the browser only ever calls Quark's own routes.

// The tutor's one voice: it reads a card, a hint and a handoff, and in later slices answers live. Picked by
// Brandon and June from four samples (Brandon, 22 Oct 2026: "The voice is Sulafat").
export const TUTOR_VOICE = "en-US-Chirp3-HD-Sulafat";

// The line's audio as MP3, in the tutor's voice unless another is named.
export function say(text: string, options: { voice?: string } = {}): Promise<Uint8Array> {
  return google.say(text, options.voice ?? TUTOR_VOICE);
}

// A clip's audio as WAV (16-bit PCM at this rate), for a check that hears what the tutor said.
export function sayWav(text: string, sampleRate: number, options: { voice?: string } = {}): Promise<Uint8Array> {
  return google.say(text, options.voice ?? TUTOR_VOICE, { wav: sampleRate });
}

// The words in one clip of 16-bit mono PCM, as the child said them.
export function hear(pcm: Uint8Array, options: { language?: string; sampleRate: number }): Promise<string> {
  return google.hear(pcm, { language: options.language ?? "en-US", sampleRate: options.sampleRate });
}
