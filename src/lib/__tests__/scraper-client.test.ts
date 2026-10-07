import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";
import {
  fetchScraperNews,
  fetchScraperVideos,
  triggerScraperVideoSync,
  NEWS_REQUEST_TIMEOUT_MS,
  SYNC_REQUEST_TIMEOUT_MS,
  VIDEO_REQUEST_TIMEOUT_MS,
  ScraperUnreachableError,
} from "@/lib/scraper-client";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const LEGACY = "https://slnewsapiscapper.onrender.com/api/news";
const VIDEOS_ENDPOINT = "https://slnewsapiscapper.onrender.com/api/videos?limit=20&page=1";
const SYNC_VIDEOS_ENDPOINT = "https://slnewsapiscapper.onrender.com/api/videos/sync";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchScraperNews", () => {
  beforeEach(() => {
    process.env.SCRAPER_API_KEY = "test-key";
    process.env.SCRAPER_BASE_URL = "https://slnewsapiscapper.onrender.com";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SCRAPER_API_KEY;
    delete process.env.SCRAPER_BASE_URL;
  });

  it("uses the legacy /api/news endpoint (full text for the app)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ title: "A", paragraphs: ["p1"] }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchScraperNews();
    expect(result).toEqual([{ title: "A", paragraphs: ["p1"] }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe(LEGACY);
    expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toMatchObject({
      Authorization: "Bearer test-key",
    });
  });

  it("accepts a raw array from the legacy endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ title: "Raw" }]));
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchScraperNews()).toEqual([{ title: "Raw" }]);
  });

  it("throws when the legacy endpoint returns 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: "unauthorized" }, 401));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchScraperNews()).rejects.toThrow("Scraper responded 401");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws ScraperUnreachableError on network failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchScraperNews()).rejects.toBeInstanceOf(ScraperUnreachableError);
  });

  it("throws when the API key is missing", async () => {
    delete process.env.SCRAPER_API_KEY;
    await expect(fetchScraperNews()).rejects.toThrow("SCRAPER_API_KEY is not set");
  });

  it("throws on an unexpected payload shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ nope: true }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchScraperNews()).rejects.toThrow("Unexpected scraper payload");
  });
});

describe("fetchScraperVideos", () => {
  beforeEach(() => {
    process.env.SCRAPER_API_KEY = "test-key";
    process.env.SCRAPER_BASE_URL = "https://slnewsapiscapper.onrender.com";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SCRAPER_API_KEY;
    delete process.env.SCRAPER_BASE_URL;
  });

  it("queries the /api/videos endpoint with Bearer auth", async () => {
    const mockVideos = [
      {
        id: 1,
        videoId: "3f4Y2N4w1bY",
        title: "Freetown Port Commissioned",
        url: "https://www.youtube.com/watch?v=3f4Y2N4w1bY",
        description: "Port expansion details",
        thumbnailUrl: "https://i.ytimg.com/vi/3f4Y2N4w1bY/hqdefault.jpg",
        channelId: "UC6L0-X7Vb7iK2fN5iW6gZ0Q",
        channelTitle: "AYV News Sierra Leone",
        publishedAt: "2026-09-01T10:00:00.000Z",
        category: ["National", "News"],
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mockVideos));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchScraperVideos(20, 1);
    expect(result).toEqual(mockVideos);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe(VIDEOS_ENDPOINT);
    expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toMatchObject({
      Authorization: "Bearer test-key",
    });
  });

  it("accepts an enveloped payload with { data: [...] }", async () => {
    const mockVideos = [
      {
        id: 2,
        videoId: "test-id",
        title: "SLBC News Bulletin",
        url: "https://www.youtube.com/watch?v=test-id",
        description: null,
        thumbnailUrl: null,
        channelId: "channel-123",
        channelTitle: "SLBC",
        publishedAt: "2026-09-02T10:00:00.000Z",
        category: ["National"],
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: mockVideos }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchScraperVideos(10, 2);
    expect(result).toEqual(mockVideos);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "https://slnewsapiscapper.onrender.com/api/videos?limit=10&page=2"
    );
  });

  it("throws on 401 unauthorized", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: "unauthorized" }, 401));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchScraperVideos()).rejects.toThrow("Scraper responded 401");
  });

  it("throws ScraperUnreachableError on fetch rejection", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("network failed"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchScraperVideos()).rejects.toBeInstanceOf(ScraperUnreachableError);
  });

  /**
   * The scraper's host sleeps when idle, and the fetch used to have no timeout —
   * so a cold instance held the page render for as long as it took to boot
   * (measured: 54.8s for /reels versus 0.8s warm).
   */
  describe("timeout", () => {
    function hangingFetch() {
      return vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(Object.assign(new Error("The operation was aborted"), { name: "TimeoutError" }))
            );
          })
      );
    }

    it("aborts a hanging request instead of holding the render open", async () => {
      const fetchMock = hangingFetch();
      vi.stubGlobal("fetch", fetchMock);

      await expect(fetchScraperVideos(10, 1, 25)).rejects.toBeInstanceOf(
        ScraperUnreachableError
      );
    });

    it("passes an abort signal on every call", async () => {
      // A fresh Response per call: a body can only be read once.
      const seen: { url: string; signal?: AbortSignal | null }[] = [];
      const fetchMock = vi.fn((url: string, init?: RequestInit) => {
        seen.push({ url, signal: init?.signal });
        return Promise.resolve(jsonResponse([]));
      });
      vi.stubGlobal("fetch", fetchMock);

      await fetchScraperVideos();
      await fetchScraperNews();
      await triggerScraperVideoSync();

      expect(seen.map((call) => call.url)).toEqual([
        VIDEOS_ENDPOINT,
        LEGACY,
        SYNC_VIDEOS_ENDPOINT,
      ]);
      for (const call of seen) {
        expect(call.signal).toBeInstanceOf(AbortSignal);
      }
    });

    it("still accepts a slow response that arrives in time", async () => {
      const videos = [
        {
          id: 3,
          videoId: "slow-but-fine",
          title: "Delayed bulletin",
          url: "https://www.youtube.com/watch?v=slow-but-fine",
          description: null,
          thumbnailUrl: null,
          channelId: "c",
          channelTitle: "SLBC",
          publishedAt: "2026-09-03T10:00:00.000Z",
          category: ["National"],
        },
      ];
      const fetchMock = vi.fn(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(jsonResponse(videos)), 15))
      );
      vi.stubGlobal("fetch", fetchMock);

      await expect(fetchScraperVideos(10, 1, 500)).resolves.toEqual(videos);
    });

    it("gives the interactive video feed less room than the news sync", () => {
      // The feed has a reader waiting; the cron does not.
      expect(VIDEO_REQUEST_TIMEOUT_MS).toBeLessThan(NEWS_REQUEST_TIMEOUT_MS);
      expect(NEWS_REQUEST_TIMEOUT_MS).toBeLessThan(SYNC_REQUEST_TIMEOUT_MS);
    });

    it("clears a measured cold boot of the host", () => {
      // A sleeping Render instance answered a probe in 5.5s, so the earlier 4s
      // cut fired on every /reels request and the scraped feed rendered nothing.
      expect(VIDEO_REQUEST_TIMEOUT_MS).toBeGreaterThan(5_500);
    });

    it("records how long a successful call took", async () => {
      const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([])));
      vi.stubGlobal("fetch", fetchMock);
      vi.mocked(logger.info).mockClear();

      await fetchScraperVideos(10, 2);

      expect(logger.info).toHaveBeenCalledWith(
        "scraper videos fetched",
        expect.objectContaining({ count: 0, limit: 10, page: 2, ms: expect.any(Number) })
      );
    });
  });
});

describe("triggerScraperVideoSync", () => {
  beforeEach(() => {
    process.env.SCRAPER_API_KEY = "test-key";
    process.env.SCRAPER_BASE_URL = "https://slnewsapiscapper.onrender.com";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SCRAPER_API_KEY;
    delete process.env.SCRAPER_BASE_URL;
  });

  it("posts to /api/videos/sync with Bearer auth", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ status: "success", count: 12 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await triggerScraperVideoSync();
    expect(result).toEqual({ status: "success", count: 12 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe(SYNC_VIDEOS_ENDPOINT);
    expect((fetchMock.mock.calls[0]![1] as RequestInit).method).toBe("POST");
    expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toMatchObject({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    });
  });

  it("throws ScraperUnreachableError on network failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("network failed"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(triggerScraperVideoSync()).rejects.toBeInstanceOf(ScraperUnreachableError);
  });
});
