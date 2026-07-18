import type { NextAuthConfig } from "next-auth";

export const authCallbacks = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).role = user.role;
        (token as Record<string, unknown>).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token as Record<string, unknown>).id as string ?? "";
        session.user.role = (token as Record<string, unknown>).role as
          | "USER"
          | "WRITER"
          | "EDITOR"
          | "ADMIN"
          | undefined;
      }
      return session;
    },
  },
} satisfies Partial<NextAuthConfig>;
