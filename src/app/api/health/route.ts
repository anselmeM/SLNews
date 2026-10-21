import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { isFcmConfigured } from "@/lib/push/fcm";

export const dynamic = "force-dynamic";

// A cold Render scraper can take ~45s to boot; the probe must be allowed to wait.
export const maxDuration = 60;

const SCRAPER_BASE = (
  process.env.SCRAPER_BASE_URL || "https://slnewsapiscapper.onrender.com"
).replace(/\/$/, "");

/** Wake and report the scraper. A cold Render instance answers 503 while booting. */
async function probeScraper(): Promise<Record<string, string>> {
  const started = Date.now();
  try {
    const response = await fetch(`${SCRAPER_BASE}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(50_000),
    });
    const latency = `${Date.now() - started}ms`;
    if (response.ok) return { status: "ok", latency };
    return { status: `http-${response.status}`, latency };
  } catch (err) {
    return {
      status: "unreachable",
      latency: `${Date.now() - started}ms`,
      error: err instanceof Error ? err.name : "unknown",
    };
  }
}

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = "ok";

    const cleanup = await db.rateLimit.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (cleanup.count > 0) checks.rateLimitCleanup = `${cleanup.count} expired`;

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const staleBreaking = await db.article.updateMany({
      where: { breaking: true, breakingSetAt: { lt: twoHoursAgo } },
      data: { breaking: false, breakingSetAt: null },
    });
    if (staleBreaking.count > 0)
      checks.breakingCleanup = `${staleBreaking.count} stale`;
  } catch (err) {
    checks.database = "error";
    healthy = false;
    logger.error("Health check: database unreachable", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  checks.push = isFcmConfigured() ? "configured" : "missing";

  const scraper = await probeScraper();
  const scraperStatus = scraper.status ?? "unknown";
  const scraperLatency = scraper.latency;
  checks.scraper = scraperStatus;
  if (scraperLatency) checks.scraperLatency = scraperLatency;

  const statusCode = healthy ? 200 : 503;
  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    { status: statusCode }
  );
}
