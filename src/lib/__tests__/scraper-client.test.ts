import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchScraperNews, ScraperUnreachableError } from "@/lib/scraper-client";

const LEGACY = "https://slnewsapiscapper.onrender.com/api/news";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
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
