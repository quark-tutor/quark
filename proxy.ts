import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Guardian pages only. The kid view never carries a Supabase session.
export const config = {
  matcher: ["/parent/:path*", "/sign-in", "/auth/:path*"],
};
