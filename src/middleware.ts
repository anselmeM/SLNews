import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)"]);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        // Without an explicit URL, protect() has no sign-in page configured and
        // returns a bare 404 for signed-out users instead of sending them to log
        // in (see Clerk: "protect() in middleware redirects to signInUrl if signed
        // out" — it 404s when that URL is unset).
        await auth.protect({ unauthenticatedUrl: new URL("/sign-in", req.url).toString() });
      }

      if (req.nextUrl.pathname === "/home") {
        return NextResponse.redirect(new URL("/", req.url));
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

  if (req.nextUrl.pathname === "/home") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
