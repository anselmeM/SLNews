import type { Article, User, Category } from "@prisma/client";
import { describe, it, expect } from "vitest";
import { mapPrismaArticle } from "@/lib/news-service";

type TestArticle = Article & {
  author: Pick<User, "name" | "image"> | null;
  categories: Pick<Category, "name">[];
};

function makeArticle(overrides: Partial<TestArticle> = {}): TestArticle {
  const now = new Date("2026-07-01T12:00:00Z");
  return {
    id: "art-1",
    title: "Test Article",
    content: "Test content goes here.",
    summary: "A test summary.",
    imageUrl: "/test.jpg",
    published: true,
    status: "PUBLISHED",
    province: "Western Area",
    district: "Freetown",
    authorId: "user-1",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    author: { name: "John Doe", image: null },
    categories: [{ name: "National" }],
    ...overrides,
  };
}

describe("mapPrismaArticle", () => {
  it("maps a full article correctly", () => {
    const result = mapPrismaArticle(makeArticle());
    expect(result).toEqual({
      id: "art-1",
      title: "Test Article",
      summary: "A test summary.",
      content: "Test content goes here.",
      imageUrl: "/test.jpg",
      category: "National",
      location: "Freetown",
      source: "John Doe",
      sourceImage: undefined,
      authorId: "user-1",
      publishedAt: "2026-07-01T12:00:00.000Z",
    });
  });

  it("falls back to province when district is null", () => {
    const result = mapPrismaArticle(makeArticle({ district: null }));
    expect(result.location).toBe("Western Area");
  });

  it("returns undefined location when both district and province are null", () => {
    const result = mapPrismaArticle(
      makeArticle({ district: null, province: null })
    );
    expect(result.location).toBeUndefined();
  });

  it("uses default category 'National' when no categories exist", () => {
    const result = mapPrismaArticle(makeArticle({ categories: [] }));
    expect(result.category).toBe("National");
  });

  it("falls back to '/globe.svg' when imageUrl is null", () => {
    const result = mapPrismaArticle(makeArticle({ imageUrl: null }));
    expect(result.imageUrl).toBe("/globe.svg");
  });

  it("uses 'SLNews Contributor' when author is null", () => {
    const result = mapPrismaArticle(makeArticle({ author: null }));
    expect(result.source).toBe("SLNews Contributor");
  });

  it("uses createdAt when publishedAt is null", () => {
    const createdAt = new Date("2026-06-01T08:00:00Z");
    const result = mapPrismaArticle(
      makeArticle({ publishedAt: null, createdAt })
    );
    expect(result.publishedAt).toBe(createdAt.toISOString());
  });

  it("uses empty string when summary is null", () => {
    const result = mapPrismaArticle(makeArticle({ summary: null }));
    expect(result.summary).toBe("");
  });
});