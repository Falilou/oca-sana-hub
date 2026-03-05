import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Increase Node.js memory for handling large datasets
  experimental: {
    // Optimize memory usage
    webpackBuildWorker: true,
  },
};

export default nextConfig;
