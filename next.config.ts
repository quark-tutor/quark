import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Prompts are read from disk at run time (core/prompts.ts).
  outputFileTracingIncludes: { "/**": ["./core/prompts/**/*.md"] },
  async redirects() {
    return [{ source: "/", destination: "/parent", permanent: false }];
  },
};

export default nextConfig;
