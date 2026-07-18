import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info("pageview", { path: body.path, referrer: body.referrer });
  } catch {
    // silently ignore malformed requests
  }

  return new NextResponse(null, { status: 204 });
}
