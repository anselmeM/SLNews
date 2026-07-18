import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default async function proxy(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/about", "/market", "/announcements"];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r)) || pathname === "/";

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/")) {
    return Response.redirect(new URL("/home", url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
