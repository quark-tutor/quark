import { describe, expect, it } from "vitest";
import { pickVoice, type VoiceLike } from "./voice.ts";

const v = (voiceURI: string, name: string, lang = "en-US", isDefault = false): VoiceLike => ({ voiceURI, name, lang, default: isDefault, localService: true });

const compact = v("com.apple.voice.compact.en-US.Samantha", "Samantha");
const enhanced = v("com.apple.voice.enhanced.en-US.Samantha", "Samantha (Enhanced)");
const premium = v("com.apple.voice.premium.en-US.Zoe", "Zoe (Premium)");
const novelty = v("com.apple.speech.synthesis.voice.Albert", "Albert");
const eloquence = v("com.apple.eloquence.en-US.Eddy", "Eddy");
const british = v("com.apple.voice.compact.en-GB.Daniel", "Daniel", "en-GB");

describe("pickVoice: the voice that reads a card aloud", () => {
  it("takes an en-US Premium voice over Enhanced and compact ones", () => {
    expect(pickVoice([novelty, compact, enhanced, premium])).toBe(premium);
  });

  it("takes Enhanced when there is no Premium", () => {
    expect(pickVoice([compact, enhanced])).toBe(enhanced);
  });

  it("knows a tier by its name when the voiceURI doesn't say", () => {
    const named = v("Zoe", "Zoe (Premium)");
    expect(pickVoice([compact, named])).toBe(named);
  });

  it("takes any en-US voice next, but never a novelty or Eloquence one", () => {
    expect(pickVoice([novelty, eloquence, compact])).toBe(compact);
  });

  it("reads en_US as en-US", () => {
    const android = v("en_US-language", "English (United States)", "en_US");
    expect(pickVoice([british, android])).toBe(android);
  });

  it("takes the browser's default voice within a tier first", () => {
    const ava = v("com.apple.voice.premium.en-US.Ava", "Ava (Premium)");
    const zoe = v("com.apple.voice.premium.en-US.Zoe", "Zoe (Premium)", "en-US", true);
    expect(pickVoice([ava, zoe])).toBe(zoe);
  });

  it("falls back to the default voice, then to none", () => {
    const def = { ...british, default: true };
    expect(pickVoice([novelty, def])).toBe(def);
    expect(pickVoice([british])).toBeNull();
    expect(pickVoice([])).toBeNull();
  });

  it("is not fooled by a word that only contains the tier's name", () => {
    const odd = v("com.example.premiumish.en-US.Kim", "Kim");
    expect(pickVoice([odd, enhanced])).toBe(enhanced);
  });
});
