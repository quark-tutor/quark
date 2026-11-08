import { useEffect, type RefObject } from "react";

// One line of the tutor's at a time: starting "Read it to me" anywhere on the page (the card, a clue, the handoff)
// stops any other line it is saying. A card's recording takes no part and plays on under the voice, because
// listening to the music while Quark reads is what the boys love most (Brandon, 8 Nov 2026; lib/kid-wiring.test.ts
// holds it). Each "Read it to me" calls started() as it starts, inside the tap, and listens with useOneAtATime().
const STARTED = "quark:voice";

export function started(audio: HTMLAudioElement) {
  window.dispatchEvent(new CustomEvent(STARTED, { detail: audio }));
}

export function useOneAtATime(audio: RefObject<HTMLAudioElement | null>) {
  useEffect(() => {
    const a = audio.current;
    const other = (e: Event) => {
      if ((e as CustomEvent<HTMLAudioElement>).detail !== a) a?.pause();
    };
    window.addEventListener(STARTED, other);
    return () => window.removeEventListener(STARTED, other);
  }, [audio]);
}
