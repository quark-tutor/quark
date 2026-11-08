import { useLayoutEffect, type RefObject } from "react";

// Leaving a card stops every sound on it, the recording and the tutor's voice alike (Brandon, 8 Nov 2026: the
// boys went to another screen with the Listen recording still playing). Next.js does not unmount a page left
// behind: it hides it with React's <Activity>, keeping its <audio> in the document, where it plays on. Activity
// runs this cleanup as it hides the page (node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md),
// and on unmount too. Every <audio> on the kid view uses it (lib/kid-wiring.test.ts holds it).
export function useStopsOnLeave(audio: RefObject<HTMLAudioElement | null>) {
  useLayoutEffect(() => {
    const a = audio.current;
    return () => a?.pause();
  }, [audio]);
}
