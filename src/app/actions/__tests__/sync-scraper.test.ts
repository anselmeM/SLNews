import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncFromScraper } from "../sync-scraper";
import { invalidate } from "@/lib/cache";
import { db } from "@/lib/db";
import { fetchScraperNews, ScraperUnreachableError } from "@/lib/scraper-client";

vi.mock("@/lib/scraper-client", () => {
  class MockScraperUnreachableError extends Error {
    constructor(msg = "Scraper unreachable") {
      super(msg);
      this.name = "ScraperUnreachableError";
    }
  }
  return {
    fetchScraperNews: vi.fn(),
    ScraperUnreachableError: MockScraperUnreachableError,
  };
});

vi.mock("@/lib/cache", () => ({
  invalidate: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_pwd"),
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    category: {
      upsert: vi.fn(),
    },
    article: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("syncFromScraper Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.user.findFirst).mockResolvedValue({
      id: "bot-user-123",
      email: "news-bot@slnews.local",
    } as never);
    (db.category.upsert as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (args: { where: { name?: string } }) =>
        Promise.resolve({
          id: `cat-${args.where.name ?? "cat"}`,
          name: args.where.name ?? "cat",
        })
    );
  });

  it("returns error when scraper is unreachable", async () => {
    vi.mocked(fetchScraperNews).mockRejectedValue(new ScraperUnreachableError());

    const res = await syncFromScraper();
    expect(res.success).toBe(false);
    expect(res.error).toBe("Scraper unreachable");
  });

  it("returns count 0 when no articles returned from scraper", async () => {
    vi.mocked(fetchScraperNews).mockResolvedValue([]);

    const res = await syncFromScraper();
    expect(res.success).toBe(true);
    expect(res.count).toBe(0);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("batches category resolution, checks existing articles, and ingests new articles", async () => {
    vi.mocked(fetchScraperNews).mockResolvedValue([
      {
        title: "Bank of Sierra Leone Implements New Monetary Measures",
        link: "https://example.com/news/1",
        author: "Financial Desk",
        source: "Awoko",
        category: ["Economy & Business"],
        paragraphs: ["The central bank has announced liquidity guidelines."],
        imageUrl: "https://example.com/images/1.jpg",
      },
      {
        title: "National Assembly Reviews Land Rights Act",
        link: "https://example.com/news/2",
        author: "Civic Reporter",
        source: "Telegraph",
        category: ["Politics & Law"],
        paragraphs: ["Parliamentarians debate boundary and tenancy reforms."],
        imageUrl: "https://example.com/images/2.jpg",
      },
    ]);

    // No existing articles
    vi.mocked(db.article.findMany).mockResolvedValue([] as never);
    vi.mocked(db.article.create).mockResolvedValue({ id: "new-art-1" } as never);

    const res = await syncFromScraper();
    expect(res.success).toBe(true);
    expect(res.count).toBe(2);

    // Verify batch findMany was called once with both titles
    expect(db.article.findMany).toHaveBeenCalledTimes(1);
    expect(db.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          title: {
            in: [
              "Bank of Sierra Leone Implements New Monetary Measures",
              "National Assembly Reviews Land Rights Act",
            ],
          },
        },
      })
    );

    // Verify articles were created with normalized category connections
    expect(db.article.create).toHaveBeenCalledTimes(2);

    // Verify cache invalidation was triggered
    expect(invalidate).toHaveBeenCalledWith("home:");
    expect(invalidate).toHaveBeenCalledWith("slnews:");
    expect(invalidate).toHaveBeenCalledWith("trending:");
    expect(invalidate).toHaveBeenCalledWith("local:");
  });

  it("updates existing articles when image is missing without creating duplicates", async () => {
    vi.mocked(fetchScraperNews).mockResolvedValue([
      {
        title: "Existing Story Title",
        link: "https://example.com/existing",
        paragraphs: ["Updated content paragraph."],
        imageUrl: "https://example.com/new-img.jpg",
        category: ["National"],
      },
    ]);

    vi.mocked(db.article.findMany).mockResolvedValue([
      {
        id: "existing-art-1",
        title: "Existing Story Title",
        imageUrl: "/globe.svg",
        summary: "Old summary",
        categories: [{ id: "cat-National", name: "National" }],
      },
    ] as never);
    vi.mocked(db.article.update).mockResolvedValue({ id: "existing-art-1" } as never);

    const res = await syncFromScraper();
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);

    expect(db.article.update).toHaveBeenCalledTimes(1);
    expect(db.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "existing-art-1" },
        data: expect.objectContaining({
          imageUrl: "https://example.com/new-img.jpg",
        }),
      })
    );
    expect(db.article.create).not.toHaveBeenCalled();
  });
});
