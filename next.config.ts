import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/local", destination: "/news", permanent: true },
      { source: "/local/:path*", destination: "/news", permanent: true },
      { source: "/national", destination: "/news", permanent: true },
      { source: "/national/:path*", destination: "/news", permanent: true },
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
        ],
      },
    ];
  },
  output: "standalone",
  turbopack: {},
};

export default nextConfig;
