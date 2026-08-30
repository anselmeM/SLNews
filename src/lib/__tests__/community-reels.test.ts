import { describe, it, expect, vi } from "vitest";
import { submitCommunityReel } from "@/app/actions/reel-actions";

// Mock next-auth
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
});
