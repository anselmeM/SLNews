import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Lightweight auth instance for the Edge Runtime — see src/auth.config.ts.
// Importing the full "@/auth" here would pull the Prisma adapter, bcrypt and
// pg into the edge bundle and could 500 protected pages intermittently.
const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/profile", "/dashboard"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (requiresAuth) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/" && request.cookies.has("slnews_visited")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
