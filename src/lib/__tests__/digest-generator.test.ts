import { describe, it, expect } from "vitest";
import {
  scoreAndFilterDigestArticles,
  buildPersonalizedDigest,
  generateDigestAudioScript,
} from "../digest-generator";
import type { NewsArticle } from "../news-service";

const makeArticle = (
  id: string,
  category: string,
  location?: string,
  hoursAgo = 2
): NewsArticle => ({
  id,
  title: `Story ${id} about ${category}`,
  summary: `Summary of story ${id} in ${category}.`,
  content: `Content of story ${id} in ${category}. `.repeat(20),
  imageUrl: `https://example.com/img-${id}.jpg`,
  category,
  location,
  source: "SLNews Bureau",
  publishedAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
  authorId: "author-1",
});

describe("digest-generator", () => {
  const sampleArticles: NewsArticle[] = [
    makeArticle("1", "Economy", "Western Area", 1),
    makeArticle("2", "Politics", "Northern", 3),
    makeArticle("3", "Tech", "Western Area", 5),
    makeArticle("4", "Sports", "Eastern", 10),
    makeArticle("5", "Education", "Southern", 12),
    makeArticle("6", "Health", "Northern", 20),
  ];

  describe("scoreAndFilterDigestArticles", () => {
    it("assigns higher scores to matching topics", () => {
      const scored = scoreAndFilterDigestArticles(sampleArticles, ["Politics", "Health"]);

      // Article 2 (Politics, 3h old) outranks the fresher but unmatched article 1.
      expect(scored[0]!.article.id).toBe("2");
      expect(scored[0]!.score).toBeGreaterThan(scored[scored.length - 1]!.score);
      expect(scored[0]!.article.matchReasons).toContain("Politics");
    });

    it("ranks recent stories even without user preferences", () => {
      const scored = scoreAndFilterDigestArticles(sampleArticles, []);
      expect(scored.length).toBe(sampleArticles.length);
      // Article 1 (1 hour ago) should have recency score
      expect(scored[0]!.article.id).toBe("1");
    });
  });

  describe("buildPersonalizedDigest", () => {
    it("generates structured sections for a user with preferences", () => {
      const digest = buildPersonalizedDigest({
        userName: "Anselme Motcho",
        preferredTopics: ["Politics", "Tech"],
        articles: sampleArticles,
        targetDate: new Date("2026-08-17T08:30:00"),
      });

      expect(digest.greeting).toBe("Good Morning, Anselme");
      expect(digest.leadStory).not.toBeNull();
      expect(digest.preferredTopics).toEqual(["Politics", "Tech"]);
      expect(digest.totalReadTimeMinutes).toBeGreaterThan(0);
      expect(digest.fallbackToNational).toBe(false);

      // Followed topics only: every topic story matches one of them.
      expect(digest.topicStories.length).toBeGreaterThan(0);
      digest.topicStories.forEach((s) => {
        expect(["Politics", "Tech"]).toContain(s.category);
      });
    });

    it("handles guest / empty preferences gracefully with fallbackToNational", () => {
      const digest = buildPersonalizedDigest({
        userName: null,
        preferredTopics: [],
        articles: sampleArticles,
        targetDate: new Date("2026-08-17T14:00:00"),
      });

      expect(digest.greeting).toBe("Good Afternoon");
      expect(digest.fallbackToNational).toBe(true);
      expect(digest.leadStory).not.toBeNull();
      expect(digest.topicStories.length).toBeGreaterThan(0);
    });

    it("handles empty article list without crashing", () => {
      const digest = buildPersonalizedDigest({
        userName: "Guest",
        articles: [],
      });

      expect(digest.leadStory).toBeNull();
      expect(digest.totalReadTimeMinutes).toBe(0);
      expect(digest.quickBriefs).toEqual([]);
    });
  });

  describe("generateDigestAudioScript", () => {
    it("produces full audio speech text from digest", () => {
      const digest = buildPersonalizedDigest({
        userName: "Anselme",
        preferredTopics: ["Politics"],
        articles: sampleArticles,
      });

      const script = generateDigestAudioScript(digest);
      expect(script).toContain("Anselme");
      expect(script).toContain("lead story");
      expect(script).toContain("SLNews digest");
    });
  });
});
