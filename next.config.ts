import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers to fix pentest findings
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Fix Clickjacking - Prevent site from being embedded in iframes
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Fix HSTS - Force HTTPS connections
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP - Content Security Policy to prevent XSS and data injection
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';",
          },
          // Additional security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
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