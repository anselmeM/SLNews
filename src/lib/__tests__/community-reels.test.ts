import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchReelsFeed, submitCommunityReel } from "@/app/actions/reel-actions";
import { invalidate } from "@/lib/cache";
import { db } from "@/lib/db";
import { fetchScraperVideos } from "@/lib/scraper-client";

// The reels feed calls the scraper API live; the whole point of these tests is
// what happens when it does not answer.
vi.mock("@/lib/scraper-client", () => ({
  fetchScraperVideos: vi.fn(),
  triggerScraperVideoSync: vi.fn(),
  ScraperUnreachableError: class ScraperUnreachableError extends Error {},
}));

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-test-123",
      email: "citizen@example.com",
      role: "USER",
    },
  }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    article: {
      create: vi.fn().mockResolvedValue({
        id: "article-test-123",
        title: "Breaking community clip",
        status: "IN_REVIEW",
      }),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({ id: "article-test-123", status: "PUBLISHED" }),
    },
    user: {
      update: vi.fn().mockResolvedValue({ id: "user-test-123", role: "WRITER" }),
    },
  },
}));

describe("Community Video Reel Actions", () => {
  it("rejects submission if title is too short", async () => {
    const res = await submitCommunityReel({
      title: "Hey",
      videoUrl: "https://www.facebook.com/watch/?v=123",
    });
    expect(res.success).toBe(false);
    expect(res.message).toContain("at least 5 characters");
  });

  it("rejects submission if video link is invalid", async () => {
    const res = await submitCommunityReel({
      title: "Valid title here",
      videoUrl: "invalid-url",
    });
    expect(res.success).toBe(false);
    expect(res.message).toContain("valid video link");
  });

  it("submits community video with IN_REVIEW status for regular users", async () => {
    const res = await submitCommunityReel({
      title: "Heavy rain causes minor flooding along Lumley",
      videoUrl: "https://www.facebook.com/watch/?v=123456789",
      category: "National",
      location: "Freetown",
    });
    expect(res.success).toBe(true);
    expect(res.isLive).toBe(false);
    expect(res.message).toContain("editorial review");
  });

  /**
   * The submitted value is a district, and it used to be written verbatim into
   * `province` as well — so strings like "Makeni (Bombali)" ended up in the
   * column the province filter reads, and the story was unreachable through it.
   */
  describe("the location a submission carries", () => {
    async function createdLocation(location: string) {
      vi.mocked(db.article.create).mockClear();
      await submitCommunityReel({
        title: "Flooding blocks the main road",
        videoUrl: "https://www.facebook.com/watch/?v=123456789",
        location,
      });
      const call = vi.mocked(db.article.create).mock.calls[0]?.[0] as {
        data: { province: string | null; district: string | null };
      };
      return call.data;
    }

    it("splits a district into its province and the district column", async () => {
      expect(await createdLocation("Makeni (Bombali)")).toMatchObject({
        province: "Northern Province",
        district: "Bombali",
      });
    });

    it("accepts a canonical district", async () => {
      expect(await createdLocation("Bo")).toMatchObject({
        province: "Southern Province",
        district: "Bo",
      });
    });

    it("accepts a province name without inventing a district", async () => {
      expect(await createdLocation("Southern Province")).toMatchObject({
        province: "Southern Province",
        district: null,
      });
    });

    it("keeps an unrecognised value as a location, never as a province", async () => {
      expect(await createdLocation("National")).toMatchObject({
        province: null,
        district: "National",
      });
    });

    it("stores nothing for an empty location", async () => {
      expect(await createdLocation("")).toMatchObject({
        province: null,
        district: null,
      });
    });
  });
});

/**
 * The feed merges three sources: scraped videos (a live third-party call),
 * community reels (Article rows) and curated broadcaster clips (a fixture). The
 * third-party call is the only one that can be slow or absent, so the feed has
 * to stay useful without it.
 */
describe("fetchReelsFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.article.findMany).mockResolvedValue([] as never);
    // The scraper hop is cached across calls within an instance.
    invalidate("reels:");
  });

  it("still returns reels when the scraper does not answer", async () => {
    vi.mocked(fetchScraperVideos).mockRejectedValue(
      new Error("Scraper unreachable") as never
    );

    const reels = await fetchReelsFeed(0, 10);

    expect(reels.length).toBeGreaterThan(0);
    // Only curated clips and published community reels can be served.
    expect(reels.every((reel) => reel.authorId !== "scraper-system")).toBe(true);
  });

  it("uses the DOM-free fallback path when the scraper returns nothing", async () => {
    vi.mocked(fetchScraperVideos).mockResolvedValue([] as never);

    const reels = await fetchReelsFeed(0, 10);

    expect(reels.length).toBeGreaterThan(0);
  });

  it("serves the cached scraper hop on a second call", async () => {
    vi.mocked(fetchScraperVideos).mockResolvedValue([] as never);

    await fetchReelsFeed(0, 10);
    await fetchReelsFeed(0, 10);

    expect(fetchScraperVideos).toHaveBeenCalledTimes(1);
  });

  it("maps a scraped video into the reel the feed expects", async () => {
    vi.mocked(fetchScraperVideos).mockResolvedValue([
      {
        id: 9,
        videoId: "abc123",
        title: "Port expansion commissioned",
        url: "https://www.youtube.com/watch?v=abc123",
        description: "Details",
        thumbnailUrl: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
        channelId: "UC1",
        channelTitle: "AYV News",
        publishedAt: "2026-09-01T10:00:00.000Z",
        category: ["National"],
      },
    ] as never);

    const reels = await fetchReelsFeed(0, 10);
    const scraped = reels.find((reel) => reel.id === "scraper-video-abc123");

    expect(scraped).toMatchObject({
      title: "Port expansion commissioned",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
      source: "AYV News",
      category: "National",
      authorId: "scraper-system",
    });
  });
});
