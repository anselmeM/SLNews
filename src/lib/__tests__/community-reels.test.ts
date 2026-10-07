import { describe, it, expect, vi } from "vitest";
import { submitCommunityReel } from "@/app/actions/reel-actions";
import { db } from "@/lib/db";

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
