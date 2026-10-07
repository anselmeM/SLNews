import { describe, expect, it, vi, beforeEach } from "vitest";
import { logger } from "@/lib/logger";
import { fetchScraperVideos, triggerScraperVideoSync } from "@/lib/scraper-client";
import { syncScraperVideos } from "@/lib/video-sync";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/lib/scraper-client", () => ({
  fetchScraperVideos: vi.fn(),
  triggerScraperVideoSync: vi.fn(),
  VIDEO_REQUEST_TIMEOUT_MS: 10_000,
}));

const fetchVideos = vi.mocked(fetchScraperVideos);
const triggerSync = vi.mocked(triggerScraperVideoSync);

const VIDEO = {
  id: 1,
  videoId: "abc123",
  title: "Freetown Port Commissioned",
  url: "https://www.youtube.com/watch?v=abc123",
  description: null,
  thumbnailUrl: null,
  channelId: "UC1",
  channelTitle: "AYV News Sierra Leone",
  publishedAt: "2026-09-01T10:00:00.000Z",
  category: ["National"],
};

beforeEach(() => {
  vi.clearAllMocks();
  triggerSync.mockResolvedValue({ status: "success" });
  fetchVideos.mockResolvedValue([VIDEO]);
});

describe("syncScraperVideos", () => {
  it("runs the ingestion and reports what came back", async () => {
    const report = await syncScraperVideos();

    expect(triggerSync).toHaveBeenCalledTimes(1);
    expect(report).toMatchObject({ triggered: true, count: 1, triggerError: null });
    expect(report.readError).toBeNull();
    expect(report.sample).toEqual([
      {
        videoId: "abc123",
        title: "Freetown Port Commissioned",
        channelTitle: "AYV News Sierra Leone",
        publishedAt: "2026-09-01T10:00:00.000Z",
        url: "https://www.youtube.com/watch?v=abc123",
      },
    ]);
  });

  it("reads without ingesting when asked", async () => {
    await syncScraperVideos({ trigger: false });

    expect(triggerSync).not.toHaveBeenCalled();
    expect(fetchVideos).toHaveBeenCalledTimes(1);
  });

  it("treats an empty list as an answer, not an error", async () => {
    // This is the measurement that decides whether a stored copy is worth
    // building: zero is a result.
    fetchVideos.mockResolvedValue([]);

    const report = await syncScraperVideos({ trigger: false });

    expect(report).toMatchObject({ count: 0, readError: null });
    expect(logger.info).toHaveBeenCalledWith(
      "videos: scraped video count",
      expect.objectContaining({ count: 0 })
    );
  });

  it("still reads the list when the ingestion trigger fails", async () => {
    triggerSync.mockRejectedValue(new Error("Scraper unreachable"));

    const report = await syncScraperVideos();

    expect(report).toMatchObject({ triggerError: "Scraper unreachable", count: 1 });
    expect(report.trigger).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      "videos: scraper ingestion trigger failed",
      expect.objectContaining({ error: "Scraper unreachable" })
    );
  });

  it("reports a failed read without throwing", async () => {
    fetchVideos.mockRejectedValue(new Error("Scraper unreachable"));

    const report = await syncScraperVideos({ trigger: false });

    expect(report).toMatchObject({ count: 0, readError: "Scraper unreachable" });
  });

  it("passes the caller's budget down to the scraper client", async () => {
    await syncScraperVideos({ limit: 7, triggerTimeoutMs: 1_234, readTimeoutMs: 567 });

    expect(triggerSync).toHaveBeenCalledWith(1_234);
    expect(fetchVideos).toHaveBeenCalledWith(7, 1, 567);
  });

  it("only samples the first few videos", async () => {
    fetchVideos.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({ ...VIDEO, videoId: `v${index}` }))
    );

    const report = await syncScraperVideos({ trigger: false });

    expect(report.count).toBe(12);
    expect(report.sample).toHaveLength(5);
  });
});
