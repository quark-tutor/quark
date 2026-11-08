import { NextResponse } from "next/server";
import { getDevice } from "@/lib/device";
import { sayLine } from "@/lib/wall";

// "Read it to me" from the paired iPad (docs/tutor-voice-slice.md): the line is named by its card and part
// ("<card id>.hint.0") or is one of the wall's own sentences ("wall.clue"), never free text. The answer is
// a redirect to a signed URL to the line's audio in the tutor's voice, so the player, started inside the tap,
// follows it and plays. The audio is made overnight (docs/lines-ahead-slice.md) or else on the first tap, and
// stored; a line the child can't see now is refused, made ahead or not (rule 3). Nothing about the child is
// written. A failure logs one line, the error's message alone, never the line's words or the child, as the hear
// route does (a failure here on 26 Oct 2026 answered 502 and logged nothing).

// The error's first line, with anything it quotes taken out: Google can quote the words it was sent, and a card's
// words can hold the child's nickname.
const fault = (error: unknown) => (error instanceof Error ? error.message : "unknown error").split("\n")[0].replace(/"[^"]*"/g, '"…"');

export async function GET(request: Request) {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });

  const line = new URL(request.url).searchParams.get("line") ?? "";
  const url = await sayLine(device, line).catch((error: unknown) => {
    console.error("say: Read it to me failed", fault(error));
    return undefined;
  });
  if (url === undefined) return NextResponse.json({ ok: false }, { status: 502 });
  if (!url) return NextResponse.json({ ok: false }, { status: 404 });
  // The signed URL lasts an hour, so the redirect itself is never kept.
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
