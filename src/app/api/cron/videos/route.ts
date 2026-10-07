import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  fetchScraperVideos,
  triggerScraperVideoSync,
  VIDEO_REQUEST_TIMEOUT_MS,
} from "@/lib/scraper-client";

/**
 * Video ingestion diagnostics.
 *
 * Why this exists: `/reels` renders six curated clips and no scraped video at
 * all, and the cause was invisible — the feed logs `scraper returned no videos`
 * whenever the endpoint answers with an empty list, which is also what a broken
 * ingestion looks like (#94). The scraper's own ingestion
 * (`POST /api/videos/sync`) was only reachable by an admin pressing a button in
 * the dashboard, so nobody could tell whether it had ever run.
 *
 * This route runs that ingestion on a schedule and reports what came back, so
 * "the scraper has nothing" and "the ingestion is not working" stop looking
 * identical. It deliberately writes nothing: it is the measurement that decides
 * whether a `Video` table is worth building, not the table itself.
 *
 * `?trigger=0` skips the ingestion and only reads, which is how you observe the
 * result of a previous run — the scraper's sync may ingest asynchronously, so
 * reading in the same breath can legitimately return the older list.
 *
 * It has no `crons` entry in vercel.json on purpose: Vercel's Hobby plan allows
 * two cron jobs and this project already uses both, which is also why
 * `keep-warm.yml` is a GitHub Action. Scheduling this belongs with the stored
 * copy of the videos (see the `Video` table note in docs/TODO.md), when a slot
 * or a different runner is available.
 */

// The whole request has to fit the function budget: the trigger waits on the
// scraper's ingestion and the read follows it.
export const maxDuration = 60;

const TRIGGER_TIMEOUT_MS = 40_000;
const SAMPLE_SIZE = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  const isValid =
    querySecret === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shouldTrigger = searchParams.get("trigger") !== "0";
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  let triggered: unknown = null;
  let triggerError: string | null = null;
  if (shouldTrigger) {
    try {
      triggered = await triggerScraperVideoSync(TRIGGER_TIMEOUT_MS);
    } catch (error) {
      triggerError = error instanceof Error ? error.message : String(error);
      logger.warn("cron/videos: scraper ingestion trigger failed", { error: triggerError });
    }
  }

  const startedAt = Date.now();
  let videos: Awaited<ReturnType<typeof fetchScraperVideos>> = [];
  let readError: string | null = null;
  try {
    videos = await fetchScraperVideos(limit, 1, VIDEO_REQUEST_TIMEOUT_MS);
  } catch (error) {
    readError = error instanceof Error ? error.message : String(error);
    logger.warn("cron/videos: reading the scraper video list failed", { error: readError });
  }
  const readMs = Date.now() - startedAt;

  // The count is the point of the exercise: it is the number that decides
  // whether a stored copy is worth having.
  logger.info("cron/videos: scraped video count", {
    count: videos.length,
    limit,
    triggered: shouldTrigger,
    readMs,
  });

  return NextResponse.json({
    success: readError === null,
    triggered: shouldTrigger,
    trigger: triggered,
    triggerError,
    count: videos.length,
    readMs,
    readError,
    // Enough to see what actually arrives — channels, titles, whether they are
    // Shorts — without dumping the whole payload into the log.
    sample: videos.slice(0, SAMPLE_SIZE).map((video) => ({
      videoId: video.videoId,
      title: video.title,
      channel: video.channelTitle,
      publishedAt: video.publishedAt,
      url: video.url,
    })),
  });
}
