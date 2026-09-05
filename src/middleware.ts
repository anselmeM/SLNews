import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)"]);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }

      if (req.nextUrl.pathname === "/" && req.cookies.has("slnews_visited")) {
        return NextResponse.redirect(new URL("/home", req.url));
      }

      return NextResponse.next();
    })
  : null;

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (clerkHandler) {
    try {
      return await clerkHandler(req, evt);
    } catch (err) {
      console.error("[Middleware] Clerk invocation failed:", err);
    }
  }

  if (req.nextUrl.pathname === "/" && req.cookies.has("slnews_visited")) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
