import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/local", destination: "/local-news", permanent: true },
      { source: "/local/:path*", destination: "/local-news", permanent: true },
      { source: "/national", destination: "/local-news", permanent: true },
      { source: "/national/:path*", destination: "/local-news", permanent: true },
    ];
  },
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' https://*.vercel.app https://*.neon.tech https://*.currentsapi.services https://slnewsapiscapper.onrender.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  output: "standalone",
  turbopack: {},
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
});
