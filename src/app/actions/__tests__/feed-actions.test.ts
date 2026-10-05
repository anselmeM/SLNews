import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUnseenNews } from "../feed-actions";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    article: { findMany: vi.fn() },
  },
}));

const articleFindMany = vi.mocked(db.article.findMany);

type Row = {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  district: string | null;
  province: string | null;
  publishedAt: Date;
  createdAt: Date;
  authorId: string;
  author: { name: string; image: string | null };
  categories: { name: string }[];
};

function row(id: string, category = "National"): Row {
  return {
    id,
    title: `Story ${id}`,
    summary: `Summary ${id}`,
    content: `Content ${id}`,
    imageUrl: null,
    district: null,
    province: "Western Area",
    publishedAt: new Date("2026-10-01T06:00:00.000Z"),
    createdAt: new Date("2026-10-01T06:00:00.000Z"),
    authorId: "author-1",
    author: { name: "SLNews Contributor", image: null },
    categories: [{ name: category }],
  };
}

/** The interest lookup selects categories; the feed query includes relations. */
function isInterestLookup(args: { select?: unknown }): boolean {
  return Boolean(args?.select);
}

function mockPool(rows: Row[], categoryNames: string[] = []) {
  articleFindMany.mockImplementation((async (args: { select?: unknown }) => {
    if (isInterestLookup(args)) {
      return categoryNames.map((name) => ({ categories: [{ name }] }));
    }
    return rows;
  }) as never);
}

describe("getUnseenNews ranking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the plain recency page when the reader has saved nothing", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`));
    mockPool(rows);

    const result = await getUnseenNews(["seen-1"], 10);

    expect(result.map((a) => a.id)).toEqual(rows.slice(0, 10).map((r) => r.id));
    // One query and an unwidened pool: zero saves must not change the query.
    expect(articleFindMany).toHaveBeenCalledTimes(1);
    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, orderBy: { publishedAt: "desc" } })
    );
  });

  it("promotes a saved-category story into the page when the reader has saves", async () => {
    // Only the last of the unseen stories is Tech, so it is off the unranked page.
    const rows = [
      ...Array.from({ length: 7 }, (_, i) => row(`a${i}`)),
      row("tech-story", "Tech"),
    ];
    mockPool(rows, ["Tech"]);

    const result = await getUnseenNews([], 10, ["saved-1"]);

    expect(result.map((a) => a.id)).toContain("tech-story");
    expect(result.findIndex((a) => a.id === "tech-story")).toBeLessThan(
      rows.findIndex((r) => r.id === "tech-story")
    );
    // The interest lookup widens the candidate pool so a promotion has room.
    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 30 })
    );
  });

  it("passes the saved ids through to the interest profile", async () => {
    mockPool([row("a")], ["Tech"]);

    await getUnseenNews([], 10, ["saved-1", "saved-2"]);

    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["saved-1", "saved-2"] } },
      })
    );
  });

  it("falls back to the unranked feed when saved stories no longer resolve", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`));
    // Saved article deleted: the interest lookup resolves to no categories.
    mockPool(rows, []);

    const result = await getUnseenNews([], 10, ["deleted-article"]);

    expect(result.map((a) => a.id)).toEqual(rows.slice(0, 10).map((r) => r.id));
  });
});
