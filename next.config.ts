import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { clerkFrontendApiOrigin } from "./src/lib/clerk-csp";

// ClerkJS needs its Frontend API host *and* its bot-protection host in the CSP.
// The Frontend API host is derived from the configured publishable key rather
// than hardcoded, so moving to the production instance — whose Frontend API is
// served from our own domain — cannot silently block auth with a CSP violation.
// See `src/lib/clerk-csp.ts`; falls back to the static origins below if unset.
const CLERK_FAPI = clerkFrontendApiOrigin();

// `connect-src` needs the `:*` form because the bot-protection challenge uses
// ephemeral ports, which a bare host does not match.
const CLERK_SCRIPTS = ["https://*.protect.clerk.com", CLERK_FAPI]
  .filter(Boolean)
  .join(" ");
const CLERK_CONNECTIONS = ["https://*.protect.clerk.com:*", CLERK_FAPI]
  .filter(Boolean)
  .join(" ");
const CLERK_IMAGES = [CLERK_FAPI].filter(Boolean).join(" ");
const CLERK_FRAMES = "https://*.protect.clerk.com";

// `next dev` compiles and hot-reloads by evaluating generated code, so the dev
// policy needs `'unsafe-eval'`. The production bundle does not: nothing in the
// app source calls eval or `new Function`, Next's production runtime ships
// precompiled output, and Clerk's own guidance treats `'unsafe-eval'` as
// development-only in Next.js.
const ALLOW_EVAL = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

// There is deliberately no AdSense domain allowlist here. Google's supported
// AdSense policy is nonce + 'strict-dynamic' and still lists 'unsafe-eval', and
// Google warns that hand-built domain lists go stale and start blocking ads
// (https://support.google.com/adsense/answer/16283098). No publisher id is
// configured in this deployment, so nothing is blocked today; if one is added,
// the fix is the nonce work, not widening this list — and the `report-uri`
// below is how that would be discovered.
//
// Where the browser sends CSP violation reports. Having somewhere to send them
// is what turns "the policy looks right" into "we would find out if it were not",
// including on devices and flows that cannot be reproduced locally.
const CSP_REPORT_URI = "/api/csp-report";

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
              `script-src 'self' 'unsafe-inline'${ALLOW_EVAL} https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.google.com https://*.facebook.net https://*.facebook.com https://facebook.com https://*.instagram.com https://instagram.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://challenges.cloudflare.com ${CLERK_SCRIPTS}`,
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              `img-src 'self' data: https: blob: https://img.clerk.com https://*.clerk.accounts.dev ${CLERK_IMAGES}`,
              "font-src 'self' fonts.gstatic.com",
              `frame-src 'self' https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.youtu.be https://youtu.be https://*.google.com https://consent.youtube.com https://accounts.google.com https://*.facebook.com https://facebook.com https://*.fb.watch https://fb.watch https://*.instagram.com https://instagram.com https://*.tiktok.com https://tiktok.com https://challenges.cloudflare.com ${CLERK_FRAMES}`,
              `child-src 'self' https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.youtu.be https://youtu.be https://*.google.com https://consent.youtube.com https://accounts.google.com https://*.facebook.com https://facebook.com https://*.fb.watch https://fb.watch https://*.instagram.com https://instagram.com https://*.tiktok.com https://tiktok.com https://challenges.cloudflare.com ${CLERK_FRAMES}`,
              "media-src 'self' https: data: blob:",
              `connect-src 'self' https://*.vercel.app https://*.neon.tech https://*.currentsapi.services https://slnewsapiscapper.onrender.com https://*.youtube.com https://youtube.com https://*.google.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://clerk-telemetry.com ${CLERK_CONNECTIONS}`,
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              `report-uri ${CSP_REPORT_URI}`,
            ]
              .map((directive) => directive.replace(/\s+/g, " ").trim())
              .join("; "),
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
