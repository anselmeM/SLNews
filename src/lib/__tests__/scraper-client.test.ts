import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchScraperNews,
  fetchScraperVideos,
  triggerScraperVideoSync,
  ScraperUnreachableError,
} from "@/lib/scraper-client";

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
