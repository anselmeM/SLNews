import type { NextAuthConfig } from "next-auth";

export const ADMIN_EMAILS = [
  "anselmemotcho@gmail.com",
];

export function isOwnerOrAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(cleanEmail)) return true;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === cleanEmail) {
    return true;
  }
  return false;
}

export const authCallbacks = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const isAdmin = isOwnerOrAdminEmail(user.email);
        (token as Record<string, unknown>).role = isAdmin ? "ADMIN" : user.role;
        (token as Record<string, unknown>).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = ((token as Record<string, unknown>).id as string) ?? "";
        const isAdmin = isOwnerOrAdminEmail(session.user.email);
        session.user.role = isAdmin
          ? "ADMIN"
          : ((token as Record<string, unknown>).role as
              | "USER"
              | "WRITER"
              | "EDITOR"
              | "ADMIN"
              | undefined);
      }
      return session;
    },
  },
} satisfies Partial<NextAuthConfig>;
