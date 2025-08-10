import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
