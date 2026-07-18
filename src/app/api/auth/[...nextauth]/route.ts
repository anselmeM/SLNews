import { type NextRequest } from "next/server";
import { handlers } from "@/auth";
import { checkDbRateLimit, getClientIp } from "@/lib/rate-limiter";

const { GET, POST: originalPost } = handlers;

async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  const rateLimit = await checkDbRateLimit(`auth:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  return originalPost(req);
}

export { GET, POST };
