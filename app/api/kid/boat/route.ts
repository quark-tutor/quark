import { NextResponse } from "next/server";
import { getDevice } from "@/lib/device";
import { actionOf, boatMove, boatScreen } from "@/lib/boat";

// A move on the trading boat from the paired iPad (docs/trading-boat-slice.md): a named move, never free text but for
// an answer's words. The reply is the next screen. A move he cannot make now, or the boat where it is not (the family's
// switch off, or no prices from its tables), is refused and nothing is written. Nothing here logs the move or the answer.

// The screen as it stands, as the page shows it: no move is made.
export async function GET() {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });
  const screen = await boatScreen(device);
  if (!screen) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(screen, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });
  const move = actionOf(await request.json().catch(() => null));
  if (!move) return NextResponse.json({ ok: false }, { status: 400 });
  const screen = await boatMove(device, move);
  if (!screen) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(screen);
}
