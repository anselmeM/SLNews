import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPhoneSavedArticles } from "../user-actions";
import { auth } from "@/auth";
import { db } from "@/lib/db";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: {
    mobileBookmark: { findMany: vi.fn() },
    article: { findMany: vi.fn() },
  },
}));

// The real mapper is pure, but news-service pulls in the db/cache modules; stub
// those so importing it has no side effects.
vi.mock("@/lib/cache", () => ({
  cachedFetch: vi.fn(),
  staleWhileRevalidate: vi.fn(),
}));

function prismaArticle(overrides: Record<string, unknown>) {
  return {
    id: "art-1",
    title: "Bank raises rates",
    content: "Body",
    summary: "Summary",
    imageUrl: "https://example.com/img.jpg",
    published: true,
    status: "PUBLISHED",
    province: null,
    district: null,
    authorId: "author-1",
    breaking: false,
    breakingSetAt: null,
    sourceUrl: "https://example.com/news/1",
    createdAt: new Date("2026-10-01T00:00:00Z"),
    updatedAt: new Date("2026-10-01T00:00:00Z"),
    publishedAt: new Date("2026-10-02T00:00:00Z"),
    author: { name: "Awoko", image: null },
    categories: [{ name: "Economy" }],
    ...overrides,
  };
}

describe("getPhoneSavedArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns nothing for a signed-out visitor without touching the database", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(getPhoneSavedArticles()).resolves.toEqual([]);
    expect(db.mobileBookmark.findMany).not.toHaveBeenCalled();
    expect(db.article.findMany).not.toHaveBeenCalled();
  });

  it("matches app bookmarks to articles by sourceUrl, newest saved first", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(db.mobileBookmark.findMany).mockResolvedValue([
      { sourceUrl: "https://example.com/news/2" },
      { sourceUrl: "https://example.com/news/1" },
    ] as never);
    vi.mocked(db.article.findMany).mockResolvedValue([
      prismaArticle({ id: "art-2", sourceUrl: "https://example.com/news/2" }),
      prismaArticle({ id: "art-1", sourceUrl: "https://example.com/news/1" }),
    ] as never);

    const articles = await getPhoneSavedArticles();

    expect(articles.map((article) => article.id)).toEqual(["art-2", "art-1"]);
    expect(articles[0]?.externalUrl).toBe("https://example.com/news/2");
    expect(db.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sourceUrl: {
            in: ["https://example.com/news/2", "https://example.com/news/1"],
          },
          published: true,
          status: "PUBLISHED",
        },
      })
    );
  });

  it("skips bookmarks with no URL and bookmarks whose URL has no article", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(db.mobileBookmark.findMany).mockResolvedValue([
      { sourceUrl: null },
      { sourceUrl: "https://example.com/unscraped" },
    ] as never);
    vi.mocked(db.article.findMany).mockResolvedValue([] as never);

    await expect(getPhoneSavedArticles()).resolves.toEqual([]);
    // Only the real URL is looked up; the null bookmark is filtered first.
    expect(db.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sourceUrl: { in: ["https://example.com/unscraped"] },
        }),
      })
    );
  });

  it("returns nothing without querying articles when no bookmark carries a URL", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(db.mobileBookmark.findMany).mockResolvedValue([
      { sourceUrl: null },
    ] as never);

    await expect(getPhoneSavedArticles()).resolves.toEqual([]);
    expect(db.article.findMany).not.toHaveBeenCalled();
  });

  it("de-duplicates repeated URLs (one bookmark per story, but be safe)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(db.mobileBookmark.findMany).mockResolvedValue([
      { sourceUrl: "https://example.com/news/1" },
      { sourceUrl: "https://example.com/news/1" },
    ] as never);
    vi.mocked(db.article.findMany).mockResolvedValue([
      prismaArticle({}),
    ] as never);

    const articles = await getPhoneSavedArticles();

    expect(articles).toHaveLength(1);
    expect(db.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sourceUrl: { in: ["https://example.com/news/1"] },
        }),
      })
    );
  });
});
