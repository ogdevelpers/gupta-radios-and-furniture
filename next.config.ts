import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Invoice uploads (images/PDFs) need more than the default 1MB
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
