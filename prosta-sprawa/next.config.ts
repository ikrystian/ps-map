import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
};

export default nextConfig;

