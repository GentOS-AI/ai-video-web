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

  // Allow external images from CDN sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Allow loading images from local backend server
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
