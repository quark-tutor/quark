import { NextResponse } from "next/server";
import { getDevice } from "@/lib/device";
import { sendAnswer } from "@/lib/wall";

// A guess from the paired iPad (docs/wonder-wall-1-slice.md, decisions 2 and 3). The reply says only what
// comes next: the outcome, the next hint or the handoff, and the next card's id once earned. A card that
// isn't on the wall today, or isn't the layer the child is at, is refused and nothing is written. Nothing
// here logs the guess.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" && UUID.test(body.cardId) ? body.cardId : null;
  const guess = typeof body?.guess === "string" ? body.guess : null;
  const seconds = typeof body?.seconds === "number" ? body.seconds : null;
  if (!cardId || guess === null) return NextResponse.json({ ok: false }, { status: 400 });

  const reply = await sendAnswer(device, { cardId, guess, seconds });
  if (!reply) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(reply);
}
