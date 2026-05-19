import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.iconaves.com" },
      { protocol: "https", hostname: "iconaves.com" },
    ],
  },
};

export default nextConfig;
