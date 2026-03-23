import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: (function() {
      const patterns: any[] = [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8000',
        },
        {
          protocol: 'https',
          hostname: 'localhost',
          port: '8000',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3000',
        },
        {
          protocol: 'https',
          hostname: 'localhost',
          port: '3000',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
      ];

      // Add production API domain from environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (apiUrl) {
        try {
          const url = new URL(apiUrl);
          patterns.push({
            protocol: url.protocol.replace(':', ''),
            hostname: url.hostname,
          });
        } catch {
          // Invalid URL, ignore
        }
      }

      return patterns;
    })(),
    unoptimized: false,
  },
};

export default nextConfig;