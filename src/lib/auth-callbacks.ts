import type { NextAuthConfig } from "next-auth";

/**
 * Strict Owner / Admin Whitelist
 * ONLY these email addresses and the process.env.ADMIN_EMAIL can ever hold the ADMIN role.
 * Any other user attempting to hold ADMIN privileges will be restricted.
 */
export const ADMIN_EMAILS = [
  "anselme.motcho@gmail.com",
  "anselmemotcho@gmail.com",
];

export function isOwnerOrAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  
  if (ADMIN_EMAILS.includes(cleanEmail)) return true;
  
  // Handle Gmail dot-insensitivity on local-part
  const [localPart, domain] = cleanEmail.split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const cleanLocal = localPart ? localPart.replace(/\./g, "") : "";
    const dotLess = `${cleanLocal}@gmail.com`;
    const normalizedAdmins = ADMIN_EMAILS.map((e) => {
      const [lp] = e.toLowerCase().split("@");
      const cleanLp = lp ? lp.replace(/\./g, "") : "";
      return `${cleanLp}@gmail.com`;
    });
    if (normalizedAdmins.includes(dotLess)) {
      return true;
    }
  }

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
        // Strict guard: if a non-owner somehow has ADMIN in DB, downgrade to EDITOR
        const safeRole = user.role === "ADMIN" && !isAdmin ? "EDITOR" : user.role;
        (token as Record<string, unknown>).role = isAdmin ? "ADMIN" : safeRole;
        (token as Record<string, unknown>).id = user.id;
        (token as Record<string, unknown>).email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = ((token as Record<string, unknown>).id as string) ?? "";
        const email = session.user.email || ((token as Record<string, unknown>).email as string);
        const isAdmin = isOwnerOrAdminEmail(email);
        const tokenRole = (token as Record<string, unknown>).role as
          | "USER"
          | "WRITER"
          | "EDITOR"
          | "ADMIN"
          | undefined;

        // Strict guard: ONLY owner email whitelist can hold ADMIN role
        const safeRole = tokenRole === "ADMIN" && !isAdmin ? "EDITOR" : tokenRole;
        session.user.role = isAdmin ? "ADMIN" : safeRole;
      }
      return session;
    },
  },
} satisfies Partial<NextAuthConfig>;
