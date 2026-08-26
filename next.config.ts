import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instantInsights: {
      validationLevel: "warning",
    },
  },
  images: {
    remotePatterns: process.env.IMAGE_CDN_URL
      ? [new URL(process.env.IMAGE_CDN_URL)]
      : [],
  },
};

export default nextConfig;
