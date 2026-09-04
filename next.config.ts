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
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.google.com https://*.facebook.net https://*.facebook.com https://facebook.com https://*.instagram.com https://instagram.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' fonts.gstatic.com",
              "frame-src 'self' https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.youtu.be https://youtu.be https://*.google.com https://consent.youtube.com https://accounts.google.com https://*.facebook.com https://facebook.com https://*.fb.watch https://fb.watch https://*.instagram.com https://instagram.com https://*.tiktok.com https://tiktok.com",
              "child-src 'self' https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.youtu.be https://youtu.be https://*.google.com https://consent.youtube.com https://accounts.google.com https://*.facebook.com https://facebook.com https://*.fb.watch https://fb.watch https://*.instagram.com https://instagram.com https://*.tiktok.com https://tiktok.com",
              "media-src 'self' https: data: blob:",
              "connect-src 'self' https://*.vercel.app https://*.neon.tech https://*.currentsapi.services https://slnewsapiscapper.onrender.com https://*.youtube.com https://youtube.com https://*.google.com",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
});
