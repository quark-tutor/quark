import { ImageResponse } from "next/og";

const SIZES = new Set([180, 192, 512]);

// The app icon: three quarks. Full-bleed so iOS and maskable crops look right.
export async function GET(_request: Request, ctx: RouteContext<"/icons/[size]">) {
  const size = Number((await ctx.params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });

  const dot = Math.round(size * 0.22);
  const quark = (color: string, left: number, top: number) => (
    <div
      style={{
        position: "absolute",
        left: Math.round(size * left - dot / 2),
        top: Math.round(size * top - dot / 2),
        width: dot,
        height: dot,
        borderRadius: dot,
        background: color,
      }}
    />
  );

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: size, height: size, background: "#2f6f62" }}>
        {quark("#f2b33d", 0.5, 0.36)}
        {quark("#e0664f", 0.37, 0.6)}
        {quark("#9fd3e0", 0.63, 0.6)}
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
