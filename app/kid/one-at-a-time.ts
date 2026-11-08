import { useEffect, type RefObject } from "react";

// One sound at a time on the kid view: starting "Read it to me" or a card's recording pauses whatever else is
// playing, so the tutor's voice never talks over a recording (a bug seen on 26 Oct 2026). Each player calls
// started() as it starts, inside the tap, and listens with useOneAtATime().
const STARTED = "quark:started";

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
    return () => {
      window.removeEventListener(STARTED, other);
      a?.pause();
    };
  }, [audio]);
}
