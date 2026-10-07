import { logger } from "@/lib/logger";
import {
  fetchScraperVideos,
  triggerScraperVideoSync,
  VIDEO_REQUEST_TIMEOUT_MS,
  type ScraperVideo,
} from "@/lib/scraper-client";

/**
 * Reading the scraper's video list, with the ingestion that fills it.
 *
 * `/reels` renders six curated clips and no scraped video, and the cause was
 * invisible: the feed logs `scraper returned no videos` both when the endpoint
 * has nothing and when the ingestion is broken. The scraper's own ingestion
 * (`POST /api/videos/sync`) was only reachable by an admin pressing a button, so
 * nobody could tell whether it had ever run.
 *
 * This is deliberately read-only with respect to our database: it measures what
 * the scraper can produce, which decides whether a stored copy (see the `Video`
 * table note in docs/TODO.md) is worth building. The write belongs with that
 * table.
 */

/** The trigger waits on the scraper's own ingestion run, so it needs its own budget. */
export const VIDEO_TRIGGER_TIMEOUT_MS = 40_000;

/** The whole request has to fit the function budget: trigger, then read. */
export const VIDEO_SYNC_MAX_DURATION_S = 60;

const SAMPLE_SIZE = 5;

export interface ScraperVideoReport {
  /** Whether the ingestion was asked to run. */
  triggered: boolean;
  /** The scraper's response to the ingestion request. */
  trigger: unknown;
  triggerError: string | null;
  count: number;
  readMs: number;
  readError: string | null;
  sample: Pick<ScraperVideo, "videoId" | "title" | "channelTitle" | "publishedAt" | "url">[];
}

export interface ScraperVideoOptions {
  /** Run the scraper's ingestion first. Off means "just read". */
  trigger?: boolean;
  limit?: number;
  /** Overridable for tests; production uses the module default. */
  triggerTimeoutMs?: number;
  readTimeoutMs?: number;
}

export async function syncScraperVideos({
  trigger = true,
  limit = 20,
  triggerTimeoutMs = VIDEO_TRIGGER_TIMEOUT_MS,
  readTimeoutMs = VIDEO_REQUEST_TIMEOUT_MS,
}: ScraperVideoOptions = {}): Promise<ScraperVideoReport> {
  let triggerResult: unknown = null;
  let triggerError: string | null = null;

  if (trigger) {
    try {
      triggerResult = await triggerScraperVideoSync(triggerTimeoutMs);
    } catch (error) {
      // A failed ingestion is an answer, not a reason to skip the measurement.
      triggerError = error instanceof Error ? error.message : String(error);
      logger.warn("videos: scraper ingestion trigger failed", { error: triggerError });
    }
  }

  const startedAt = Date.now();
  let videos: ScraperVideo[] = [];
  let readError: string | null = null;
  try {
    videos = await fetchScraperVideos(limit, 1, readTimeoutMs);
  } catch (error) {
    readError = error instanceof Error ? error.message : String(error);
    logger.warn("videos: reading the scraper video list failed", { error: readError });
  }
  const readMs = Date.now() - startedAt;

  // The count is the point: it is the number that decides whether a stored copy
  // is worth having, and it distinguishes an empty scraper from a broken one.
  logger.info("videos: scraped video count", {
    count: videos.length,
    limit,
    triggered: trigger,
    readMs,
  });

  return {
    triggered: trigger,
    trigger: triggerResult,
    triggerError,
    count: videos.length,
    readMs,
    readError,
    // Enough to see what actually arrives — channels, titles, whether they are
    // Shorts — without dumping a whole payload into the log.
    sample: videos.slice(0, SAMPLE_SIZE).map((video) => ({
      videoId: video.videoId,
      title: video.title,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      url: video.url,
    })),
  };
}
