import type { NextConfig } from "next";

function mediaRemotePatterns() {
  const bases = [
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://127.0.0.1:5080",
    "http://localhost:5080",
    "http://193.36.84.230:5080",
  ].filter(Boolean) as string[];

  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
  for (const base of bases) {
    try {
      const url = new URL(base);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/api/media/**",
      });
    } catch {
      /* ignore bad env */
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app (avoids parent-folder lockfile noise)
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: mediaRemotePatterns(),
  },
};

export default nextConfig;
