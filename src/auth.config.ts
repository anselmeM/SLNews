import type { NextAuthConfig } from "next-auth";
import { authCallbacks } from "@/lib/auth-callbacks";

// Edge-runtime-safe subset of the auth config, used ONLY by middleware
// (src/proxy.ts). It deliberately excludes the Prisma adapter, credentials
// provider, bcrypt, and pg — all Node-only modules that must not be bundled
// into the Edge Runtime. The middleware only decodes JWT sessions, which
// needs just the secret + callbacks.
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
  ...authCallbacks,
} satisfies NextAuthConfig;
