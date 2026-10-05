import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUnseenNews } from "../feed-actions";
import { auth } from "@/auth";
import { db } from "@/lib/db";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    article: { findMany: vi.fn() },
    savedArticle: { findMany: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

const authMock = vi.mocked(auth);
const articleFindMany = vi.mocked(db.article.findMany);
const savedFindMany = vi.mocked(db.savedArticle.findMany);
const userFindUnique = vi.mocked(db.user.findUnique);

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
function mockPool(rows: Row[], savedArticleCategories: string[] = []) {
  articleFindMany.mockImplementation((async (args: { select?: unknown }) => {
    if (args?.select) {
      return savedArticleCategories.map((name) => ({ categories: [{ name }] }));
    }
    return rows;
  }) as never);
}

function signedIn(userId = "user-1") {
  authMock.mockResolvedValue({ user: { id: userId } } as never);
}

function noProfile() {
  signedIn();
  userFindUnique.mockResolvedValue({ preferredTopics: [] } as never);
  savedFindMany.mockResolvedValue([] as never);
}

describe("getUnseenNews ranking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(null as never);
    userFindUnique.mockResolvedValue(null as never);
    savedFindMany.mockResolvedValue([] as never);
  });

  it("keeps the plain recency page for a signed-out reader", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`));
    mockPool(rows);

    const result = await getUnseenNews(["seen-1"], 10);

    expect(result.map((a) => a.id)).toEqual(rows.slice(0, 10).map((r) => r.id));
    // No profile to read: one query, unwidened pool, recency order untouched.
    expect(articleFindMany).toHaveBeenCalledTimes(1);
    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, orderBy: { publishedAt: "desc" } })
    );
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  it("keeps the plain recency page for a signed-in reader with no preferences", async () => {
    noProfile();
    const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`));
    mockPool(rows);

    const result = await getUnseenNews([], 10);

    expect(result.map((a) => a.id)).toEqual(rows.slice(0, 10).map((r) => r.id));
    expect(articleFindMany).toHaveBeenCalledTimes(1);
  });

  it("promotes a followed topic into the page", async () => {
    signedIn();
    userFindUnique.mockResolvedValue({ preferredTopics: ["Tech"] } as never);
    // Only the last unseen story is Tech, so it is off the unranked page.
    const rows = [
      ...Array.from({ length: 7 }, (_, i) => row(`a${i}`)),
      row("tech-story", "Tech"),
    ];
    mockPool(rows);

    const result = await getUnseenNews([], 10);

    expect(result.map((a) => a.id)).toContain("tech-story");
    expect(result.findIndex((a) => a.id === "tech-story")).toBeLessThan(
      rows.findIndex((r) => r.id === "tech-story")
    );
    // The profile widens the candidate pool so a promotion has room.
    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 30 })
    );
  });

  it("normalises legacy topic names before ranking", async () => {
    signedIn();
    userFindUnique.mockResolvedValue({ preferredTopics: ["Technology"] } as never);
    const rows = [...Array.from({ length: 4 }, (_, i) => row(`a${i}`)), row("tech", "Tech")];
    mockPool(rows);

    const result = await getUnseenNews([], 5);

    expect(result.map((a) => a.id)).toContain("tech");
  });

  it("promotes a category the reader saved, without any followed topic", async () => {
    signedIn();
    userFindUnique.mockResolvedValue({ preferredTopics: [] } as never);
    savedFindMany.mockResolvedValue([{ articleId: "saved-1" }] as never);
    const rows = [...Array.from({ length: 7 }, (_, i) => row(`a${i}`)), row("tech", "Tech")];
    mockPool(rows, ["Tech"]);

    const result = await getUnseenNews([], 10);

    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["saved-1"] } } })
    );
    expect(result.findIndex((a) => a.id === "tech")).toBeLessThan(
      rows.findIndex((r) => r.id === "tech")
    );
  });

  it("falls back to the unranked feed when the profile cannot be read", async () => {
    signedIn();
    userFindUnique.mockRejectedValue(new Error("db down") as never);
    const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`));
    mockPool(rows, ["Tech"]);

    const result = await getUnseenNews([], 10);

    expect(result.map((a) => a.id)).toEqual(rows.slice(0, 10).map((r) => r.id));
  });

  it("excludes the ids the reader has already seen", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(`a${i}`));
    mockPool(rows);

    await getUnseenNews(["a0", "a1"], 10);

    expect(articleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { published: true, status: "PUBLISHED", id: { notIn: ["a0", "a1"] } },
      })
    );
  });
});
