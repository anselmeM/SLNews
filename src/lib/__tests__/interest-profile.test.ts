import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  interestCategoriesFromArticleIds,
  savedInterestCategories,
  MAX_INTEREST_SOURCES,
} from "../interest-profile";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    article: { findMany: vi.fn() },
    savedArticle: { findMany: vi.fn() },
  },
}));

const articleFindMany = vi.mocked(db.article.findMany);
const savedFindMany = vi.mocked(db.savedArticle.findMany);

describe("interestCategoriesFromArticleIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    articleFindMany.mockResolvedValue([] as never);
  });

  it("never touches the database when nothing is saved", async () => {
    const categories = await interestCategoriesFromArticleIds([]);

    expect(categories.size).toBe(0);
    expect(articleFindMany).not.toHaveBeenCalled();
  });

  it("collects the categories of the saved stories", async () => {
    articleFindMany.mockResolvedValue([
      { categories: [{ name: "Tech" }, { name: "Business" }] },
      { categories: [{ name: "Tech" }] },
    ] as never);

    const categories = await interestCategoriesFromArticleIds(["a1", "a2"]);

    expect([...categories].sort()).toEqual(["Business", "Tech"]);
    expect(articleFindMany).toHaveBeenCalledWith({
      where: { id: { in: ["a1", "a2"] } },
      select: { categories: { select: { name: true } } },
    });
  });

  it("deduplicates ids and caps how many saved stories shape the profile", async () => {
    const ids = Array.from({ length: MAX_INTEREST_SOURCES + 10 }, (_, i) => `a${i}`);

    await interestCategoriesFromArticleIds(["a0", "a0", ...ids]);

    const [{ where }] = articleFindMany.mock.calls[0] as [{ where: { id: { in: string[] } } }];
    expect(where.id.in).toHaveLength(MAX_INTEREST_SOURCES);
    expect(new Set(where.id.in).size).toBe(MAX_INTEREST_SOURCES);
  });

  it("tolerates a saved id whose article has no categories", async () => {
    articleFindMany.mockResolvedValue([{ categories: [] }] as never);

    expect((await interestCategoriesFromArticleIds(["gone"])).size).toBe(0);
  });
});

describe("savedInterestCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedFindMany.mockResolvedValue([] as never);
    articleFindMany.mockResolvedValue([] as never);
  });

  it("returns nothing for a missing user without querying", async () => {
    expect((await savedInterestCategories("")).size).toBe(0);
    expect(savedFindMany).not.toHaveBeenCalled();
  });

  it("reads the reader's newest saves and maps them to categories", async () => {
    savedFindMany.mockResolvedValue([
      { articleId: "a1" },
      { articleId: "a2" },
    ] as never);
    articleFindMany.mockResolvedValue([{ categories: [{ name: "Sports" }] }] as never);

    const categories = await savedInterestCategories("user-1");

    expect([...categories]).toEqual(["Sports"]);
    expect(savedFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { articleId: true },
      orderBy: { createdAt: "desc" },
      take: MAX_INTEREST_SOURCES,
    });
    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["a1", "a2"] } } })
    );
  });
});
