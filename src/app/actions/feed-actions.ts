"use server";

import { db } from "@/lib/db";
import { rankFeedByInterest } from "@/lib/feed-ranking";
import { interestCategoriesFromArticleIds } from "@/lib/interest-profile";
import type { NewsArticle } from "@/lib/news-service";
import { fetchMixedNews, fetchLocalNews, fetchWorldNews, mapPrismaArticle } from "@/lib/news-service";

// The home feed is a fixed mix of international + national news for everyone
// (topic preferences are no longer used to filter it).
export async function getHomeFeed(skip = 0, take = 10): Promise<NewsArticle[]> {
  return fetchMixedNews(skip, take);
}

export async function getLocalNewsPage(
  skip = 0,
  take = 10,
  province?: string,
  district?: string
): Promise<NewsArticle[]> {
  return fetchLocalNews(province, district, skip, take);
}

export async function getWorldNewsPage(topic: string, skip = 0, take = 10): Promise<NewsArticle[]> {
  return fetchWorldNews(topic, skip, take);
}

// Fetches novelty stories the reader has not seen, ranked with the interest
// signal derived from their saved articles. The candidate pool is widened so
// interest matches have somewhere to be promoted from — see `rankFeedByInterest`
// for why the promotion is capped at one in three slots instead of sorting by
// interest, which would turn the feed into a filter bubble.
const INTEREST_CANDIDATE_MULTIPLIER = 3;

export async function getUnseenNews(
  seenIds: string[],
  take = 10,
  savedArticleIds: string[] = []
): Promise<NewsArticle[]> {
  const where: Record<string, unknown> = {
    published: true,
    status: "PUBLISHED",
  };
  if (seenIds.length > 0) {
    where.id = { notIn: seenIds };
  }

  // Zero saved articles (signed-out reader, new account, or nothing bookmarked
  // yet) short-circuits inside this call and leaves the recency order intact.
  const interestCategories = await interestCategoriesFromArticleIds(savedArticleIds);

  const articles = await db.article.findMany({
    where: where as Record<string, unknown>,
    orderBy: { publishedAt: "desc" },
    include: {
      author: true,
      categories: true,
    },
    take: interestCategories.size > 0 ? take * INTEREST_CANDIDATE_MULTIPLIER : take,
  });

  return rankFeedByInterest(articles.map(mapPrismaArticle), interestCategories, take);
}
