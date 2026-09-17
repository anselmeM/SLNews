import { currentUser } from "@clerk/nextjs/server";
import { isOwnerOrAdminEmail } from "@/lib/auth-callbacks";
import { db } from "@/lib/db";
import { reportError } from "@/lib/error-reporting";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "USER" | "WRITER" | "EDITOR" | "ADMIN";
}

export interface AppSession {
  user: SessionUser;
}

/**
 * Universal auth() bridge for SLNews.
 * Retrieves authenticated Clerk user, ensures user record exists in Neon Postgres,
 * strictly enforces the Owner ADMIN whitelist, and returns { user }.
 */
export async function auth(): Promise<AppSession | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      null;

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "SLNews User";
    const image = user.imageUrl || null;

    const isAdmin = isOwnerOrAdminEmail(email);

    if (email) {
      // Upsert user in Neon Postgres database
      const dbUser = await db.user.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name,
          image,
          ...(isAdmin ? { role: "ADMIN" } : {}),
        },
        create: {
          id: user.id,
          email: email.toLowerCase(),
          name,
          image,
          role: isAdmin ? "ADMIN" : "USER",
        },
      });

      const safeRole =
        dbUser.role === "ADMIN" && !isAdmin ? "EDITOR" : (dbUser.role as SessionUser["role"]);

      return {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          role: isAdmin ? "ADMIN" : safeRole,
        },
      };
    }

    return {
      user: {
        id: user.id,
        name,
        image,
        email: null,
        role: "USER",
      },
    };
  } catch (err) {
    // Next throws a "Dynamic server usage" error as a control-flow signal to
    // opt a route out of static rendering — that is not a real failure, so don't
    // report it. Anything else (a Clerk session-lookup or Neon upsert failure)
    // means a signed-in user silently appears signed out, so surface it.
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("Dynamic server usage")) {
      reportError(err, { where: "auth()" });
    }
    return null;
  }
}
