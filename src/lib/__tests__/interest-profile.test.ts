import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  feedInterestCategories,
  interestCategoriesFromArticleIds,
  normalizeTopics,
  savedInterestCategories,
  MAX_INTEREST_SOURCES,
} from "../interest-profile";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    article: { findMany: vi.fn() },
    savedArticle: { findMany: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

const articleFindMany = vi.mocked(db.article.findMany);
const savedFindMany = vi.mocked(db.savedArticle.findMany);
const userFindUnique = vi.mocked(db.user.findUnique);

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

describe("normalizeTopics", () => {
  it("renames the legacy Technology topic and dedupes", () => {
    expect(normalizeTopics(["Technology", "Tech", "Politics"])).toEqual([
      "Tech",
      "Politics",
    ]);
  });

  it("drops values the app does not offer as topics", () => {
    expect(normalizeTopics(["NotATopic", "Sports"])).toEqual(["Sports"]);
  });
});

describe("feedInterestCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedFindMany.mockResolvedValue([] as never);
    articleFindMany.mockResolvedValue([] as never);
    userFindUnique.mockResolvedValue({ preferredTopics: [] } as never);
  });

  it("returns nothing for a missing user without querying", async () => {
    expect((await feedInterestCategories("")).size).toBe(0);
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(savedFindMany).not.toHaveBeenCalled();
  });

  it("unions the followed topics with the saved-story categories", async () => {
    userFindUnique.mockResolvedValue({ preferredTopics: ["Technology"] } as never);
    savedFindMany.mockResolvedValue([{ articleId: "a1" }] as never);
    articleFindMany.mockResolvedValue([{ categories: [{ name: "Sports" }] }] as never);

    const categories = await feedInterestCategories("user-1");

    // "Technology" is the legacy name for "Tech" and must rank as Tech.
    expect([...categories].sort()).toEqual(["Sports", "Tech"]);
  });

  it("reads the followed topics from the reader's own row", async () => {
    await feedInterestCategories("user-9");

    expect(userFindUnique).toHaveBeenCalledWith({
      where: { id: "user-9" },
      select: { preferredTopics: true },
    });
  });

  it("ignores a topic that is not offered", async () => {
    userFindUnique.mockResolvedValue({ preferredTopics: ["Gossip"] } as never);

    expect((await feedInterestCategories("user-1")).size).toBe(0);
  });
});
