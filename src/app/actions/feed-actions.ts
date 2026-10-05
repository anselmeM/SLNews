"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rankFeedByInterest } from "@/lib/feed-ranking";
import { feedInterestCategories } from "@/lib/interest-profile";
import type { NewsArticle } from "@/lib/news-service";
import { fetchMixedNews, fetchLocalNews, fetchWorldNews, mapPrismaArticle } from "@/lib/news-service";

// The home feed is a fixed mix of international + national news for everyone:
// topics rank it (see `getUnseenNews`), they never filter it.
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
// profile — the topics they follow plus the categories of the stories they have
// saved. The profile is resolved here rather than passed in from the client, so
// the refresh path and the server-rendered first page rank identically. The
// candidate pool is widened so interest matches have somewhere to be promoted
// from — see `rankFeedByInterest` for why the promotion is capped at one in
// three slots instead of sorting by interest, which would make a filter bubble.
const INTEREST_CANDIDATE_MULTIPLIER = 3;

async function currentInterestCategories(): Promise<Set<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Set();
    return await feedInterestCategories(session.user.id);
  } catch {
    // Ranking is a bonus, never a failure mode: if the profile cannot be read
    // the reader still gets the unranked feed instead of an error.
    return new Set();
  }
}

export async function getUnseenNews(seenIds: string[], take = 10): Promise<NewsArticle[]> {
  const where: Record<string, unknown> = {
    published: true,
    status: "PUBLISHED",
  };
  if (seenIds.length > 0) {
    where.id = { notIn: seenIds };
  }

  // A signed-out reader, a new account, or one with no topics and no saves
  // resolves to an empty profile and leaves the recency order intact.
  const interestCategories = await currentInterestCategories();

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
