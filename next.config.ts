import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Force TypeScript type checking during build
  typescript: {
    // Set to true to fail build on type errors
    ignoreBuildErrors: false,
  },

  // Force ESLint checking during build
  eslint: {
    // Set to true to fail build on linting errors
    ignoreDuringBuilds: false,
  },

  // Silence the turbopack workspace warning
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
