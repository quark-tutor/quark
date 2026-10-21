import { createHash, timingSafeEqual } from "node:crypto";

// Vercel sends CRON_SECRET as "Authorization: Bearer <value>" on every cron firing, and the Sunday route
// refuses anything else. Both sides are hashed first so the comparison takes the same time whatever the
// header says (and works on strings of different lengths). With no secret set, nothing is authorized:
// a copy that has not been given one answers 401 and does nothing.
export function authorized(header: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(header ?? ""), digest(`Bearer ${secret}`));
}
