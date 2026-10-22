// Which of the browser's voices reads a card aloud. Safari reads with its compact voice unless the page picks
// one: the voice chosen in the iPad's Spoken Content settings is not used by a web page (Brandon, 22 Oct 2026).
// So the wall picks, in this order: an en-US Premium voice, then an en-US Enhanced one, then any en-US voice,
// then the browser's default. Within a tier, the browser's default voice first, then the list's order.

export type VoiceLike = { name: string; lang: string; voiceURI: string; default: boolean; localService: boolean };

const enUS = (v: VoiceLike) => v.lang.replace("_", "-").toLowerCase() === "en-us";

// "com.apple.voice.premium.en-US.Zoe", "Zoe (Premium)", "com.apple.voice.enhanced.en-US.Samantha".
const isTier = (v: VoiceLike, tier: "premium" | "enhanced") => new RegExp(`\\b${tier}\\b`, "i").test(`${v.voiceURI} ${v.name}`);

// Apple's novelty voices (Bells, Bubbles, Zarvox) and Eloquence voices (Eddy, Flo) say en-US too, and read a
// card worse than the compact voice does, so "any en-US voice" never means one of them.
const isNovelty = (v: VoiceLike) => /speech\.synthesis\.voice|eloquence/i.test(v.voiceURI);

const first = <V extends VoiceLike>(list: V[]): V | null => list.find((v) => v.default) ?? list[0] ?? null;

// Null leaves the choice to the browser (its default voice, for the utterance's lang).
export function pickVoice<V extends VoiceLike>(voices: readonly V[]): V | null {
  const us = voices.filter(enUS);
  return (
    first(us.filter((v) => isTier(v, "premium"))) ??
    first(us.filter((v) => isTier(v, "enhanced"))) ??
    first(us.filter((v) => !isNovelty(v))) ??
    voices.find((v) => v.default) ??
    null
  );
}
