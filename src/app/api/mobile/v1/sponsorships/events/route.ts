/**
 * `/api/mobile/v1/sponsorships/events` — impression and tap counters.
 *
 * The app posts `{ id, type: "impression" | "tap" }` when a sold unit is rendered or
 * tapped. Public and unauthenticated by design: no user data is attached, and the
 * endpoint answers 200 even for an unknown id so a stale cache never surfaces an
 * error in the UI. Rate limited per IP to keep counters honest-ish.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkDbRateLimit, getClientIp } from "@/lib/rate-limiter";

const RATE_LIMIT = { maxRequests: 120, windowMs: 60_000 };

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const limit = await checkDbRateLimit(
    `sponsorship-events:${getClientIp(request)}`,
    RATE_LIMIT
  );
  if (!limit.allowed) return json({ ok: true, counted: false });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Expected a JSON body." }, 400);
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  if (!id || (type !== "impression" && type !== "tap")) {
    return json({ error: "Expected id and type impression|tap." }, 400);
  }

  try {
    await db.sponsorship.update({
      where: { id },
      data:
        type === "impression"
          ? { impressions: { increment: 1 } }
          : { taps: { increment: 1 } },
    });
    return json({ ok: true, counted: true });
  } catch {
    // Unknown/deleted id: not an error for the caller.
    return json({ ok: true, counted: false });
  }
}
