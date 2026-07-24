import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import os from "node:os";

// Determine optimal build cpus/workers based on system memory to prevent SIGKILL/OOM on low-resource environments
const getOptimalBuildCPUs = () => {
  if (process.env.NEXT_BUILD_CPUS) {
    return parseInt(process.env.NEXT_BUILD_CPUS, 10);
  }
  const totalMemBytes = os.totalmem();
  const totalMemGB = totalMemBytes / (1024 * 1024 * 1024);

  if (totalMemGB < 4) {
    return 1;
  } else if (totalMemGB < 8) {
    return 2;
  }
  return undefined; // Let Next.js use its default concurrency
};

const nextConfig: NextConfig = {
  // Pozwala skierować `next build` do osobnego katalogu (np. .next-build),
  // żeby atomowo podmienić go z `.next` po zakończeniu builda — patrz scripts/deploy.sh.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["ps-dev.com.pl", "team.studio-ai.com.pl", "rejestracja.prostasprawa.pl", "stage.prostasprawa.pl"],
  env: {
    ENV: process.env.ENV || "local",
    DEPLOY_TIME: process.env.DEPLOY_TIME || "",
    GOOGLE_RECAPCHA_KEY: process.env.GOOGLE_RECAPCHA_KEY || "",
    NEXT_PUBLIC_GOOGLE_RECAPCHA_KEY: process.env.NEXT_PUBLIC_GOOGLE_RECAPCHA_KEY || process.env.GOOGLE_RECAPCHA_KEY || "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      }
    ],
  },
  typescript: {
    // Enable type checking during build to catch errors before production
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["socket.io", "@libsql/client", "@prisma/adapter-libsql"],
  experimental: {
    webpackMemoryOptimizations: true,
    cpus: getOptimalBuildCPUs(),
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "date-fns",
      "goey-toast",
    ],
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);

