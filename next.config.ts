import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app (avoids parent-folder lockfile noise)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
