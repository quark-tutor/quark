import { NextResponse } from "next/server";
import { getDevice } from "@/lib/device";
import { sayLine } from "@/lib/wall";

// "Read it to me" from the paired iPad (docs/tutor-voice-slice.md): the line is named by its card and part
// ("<card id>.hint.0") or is one of the wall's own sentences ("wall.clue"), never free text. The answer is
// a redirect to a signed URL to the line's audio in the tutor's voice, so the player, started inside the tap,
// follows it and plays. The audio is made the first time and stored; a line the child can't see now is
// refused. Nothing about the child is written, and nothing here logs.

export async function GET(request: Request) {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });

  const line = new URL(request.url).searchParams.get("line") ?? "";
  const url = await sayLine(device, line).catch(() => undefined);
  if (url === undefined) return NextResponse.json({ ok: false }, { status: 502 });
  if (!url) return NextResponse.json({ ok: false }, { status: 404 });
  // The signed URL lasts an hour, so the redirect itself is never kept.
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
