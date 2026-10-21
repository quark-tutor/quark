import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Prompts and the safety floor are read from disk at run time (core/prompts.ts).
  outputFileTracingIncludes: { "/**": ["./core/prompts/**/*.md", "./gate/safety-floor.md"] },
  // The dev server, opened from an iPad on the home Wi-Fi: DEV_ORIGIN is the laptop's address for that run
  // (npm run dev -- --hostname 0.0.0.0), so no address is kept in the repository. Nothing in production.
  allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : [],
  async redirects() {
    return [{ source: "/", destination: "/parent", permanent: false }];
  },
};

export default nextConfig;
