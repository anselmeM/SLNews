import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

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
    if (staleBreaking.count > 0) checks.breakingCleanup = `${staleBreaking.count} stale`;
  } catch (err) {
    checks.database = "error";
    healthy = false;
    logger.error("Health check: database unreachable", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

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
