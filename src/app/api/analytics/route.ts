import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { returningShare, toDayKey } from "@/lib/retention";

const DAY_MS = 86_400_000;
const DEFAULT_WINDOW_DAYS = 14;
const MAX_WINDOW_DAYS = 60;
// Best-effort, in-memory only (see `checkRateLimit`): a device pings once a day,
// so this only stops one caller from rewriting the metric in a loop. Nothing
// about the caller is stored, which is why the DB-backed limiter is not used —
// its keys would persist IP addresses for an analytics endpoint that promises
// not to identify anyone.
const SESSION_PINGS_PER_HOUR = 120;

type AnalyticsBody = {
  kind?: unknown;
  path?: unknown;
  referrer?: unknown;
  returning?: unknown;
};

/**
 * Records the two things the habit loop is judged on: page views (a log line,
 * unchanged) and one anonymous session ping per device per day, which is what
 * makes a return rate measurable at all.
 */
export async function POST(request: Request) {
  let body: AnalyticsBody | null = null;
  try {
    body = (await request.json()) as AnalyticsBody;
  } catch {
    // silently ignore malformed requests
  }

  if (body?.kind === "session") {
    const limit = checkRateLimit(`analytics:${getClientIp(request)}`, {
      maxRequests: SESSION_PINGS_PER_HOUR,
      windowMs: 3_600_000,
    });
    if (!limit.allowed) {
      return new NextResponse(null, { status: 429 });
    }

    await recordSession(body.returning === true);
    return new NextResponse(null, { status: 204 });
  }

  logger.info("pageview", { path: body?.path, referrer: body?.referrer });

  return new NextResponse(null, { status: 204 });
}

async function recordSession(isReturning: boolean): Promise<void> {
  const day = new Date(`${toDayKey()}T00:00:00.000Z`);

  try {
    await db.retentionDay.upsert({
      where: { day },
      create: {
        day,
        firstVisits: isReturning ? 0 : 1,
        returningVisits: isReturning ? 1 : 0,
      },
      update: isReturning
        ? { returningVisits: { increment: 1 } }
        : { firstVisits: { increment: 1 } },
    });
  } catch (error) {
    // The beacon is fire-and-forget: a missing table or a database wobble must
    // not fail a reader's page load, but it must be visible to operators.
    logger.warn("analytics: session not recorded", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * The return rate, as daily aggregates: how many sessions came from devices
 * that had already visited on an earlier day, against first-ever visits. This
 * is how the habit-loop work below is judged — if returning sessions do not
 * hold up, none of it worked.
 */
export async function GET(request: Request) {
  const requested = Number.parseInt(
    new URL(request.url).searchParams.get("days") ?? "",
    10
  );
  const windowDays = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_WINDOW_DAYS)
    : DEFAULT_WINDOW_DAYS;

  const since = new Date(`${toDayKey(new Date(Date.now() - (windowDays - 1) * DAY_MS))}T00:00:00.000Z`);

  try {
    const rows = await db.retentionDay.findMany({
      where: { day: { gte: since } },
      orderBy: { day: "asc" },
    });

    return NextResponse.json({
      days: rows.map((row) => ({
        day: toDayKey(row.day),
        firstVisits: row.firstVisits,
        returningVisits: row.returningVisits,
        returningShare: returningShare(row.firstVisits, row.returningVisits),
      })),
    });
  } catch (error) {
    logger.warn("analytics: retention lookup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { days: [], error: "retention data unavailable" },
      { status: 500 }
    );
  }
}
