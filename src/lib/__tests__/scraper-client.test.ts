import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchScraperNews, ScraperUnreachableError } from "@/lib/scraper-client";

const LEGACY = "https://slnewsapiscapper.onrender.com/api/news";
const V1 = "https://slnewsapiscapper.onrender.com/v1/news";

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

  it("uses the /v1/news endpoint when available", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ title: "A" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchScraperNews();
    expect(result).toEqual([{ title: "A" }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe(V1);
    expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer test-key" });
  });

  it("falls back to the legacy /api/news when /v1 returns 404", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "not found" }, 404))
      .mockResolvedValueOnce(jsonResponse([{ title: "Legacy" }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchScraperNews();
    expect(result).toEqual([{ title: "Legacy" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]![0]).toBe(LEGACY);
  });

  it("accepts a raw array from the legacy endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ title: "Raw" }]));
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchScraperNews()).toEqual([{ title: "Raw" }]);
  });

  it("throws (no fallback) when /v1 returns 401", async () => {
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
