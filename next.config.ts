import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

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
        // Production domain (for uploaded images/videos)
        protocol: "https",
        hostname: "adsvideo.co",
      },
      {
        // Production domain with www
        protocol: "https",
        hostname: "www.adsvideo.co",
      },
      {
        // Allow loading images from local backend server (development only)
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
