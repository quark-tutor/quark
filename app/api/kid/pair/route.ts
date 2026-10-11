import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_MAX_AGE,
  generateDeviceToken,
  hashSecret,
  isPairingCode,
} from "@/lib/pairing";
import { createAdminClient } from "@/lib/supabase/admin";

// An iPad trades a six-digit code from /parent for a long-lived device cookie.
// The database checks the code, counts wrong guesses, and creates the device in one step.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  if (!isPairingCode(code)) return NextResponse.json({ ok: false }, { status: 400 });

  const token = generateDeviceToken();
  const { data, error } = await createAdminClient().rpc("claim_device_pairing", {
    p_code_hash: hashSecret(code),
    p_token_hash: hashSecret(token),
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ ok: false }, { status: 401 });

  (await cookies()).set(DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}
