"use server";

import { db } from "@/lib/db";
import type { NewsArticle } from "@/lib/news-service";
import { fetchMixedNews, fetchLocalNews, fetchWorldNews, mapPrismaArticle } from "@/lib/news-service";

// The home feed is a fixed mix of international + national news for everyone
// (topic preferences are no longer used to filter it).
export async function getHomeFeed(skip = 0, take = 10): Promise<NewsArticle[]> {
  return fetchMixedNews(skip, take);
}

export async function getLocalNewsPage(skip = 0, take = 10): Promise<NewsArticle[]> {
  return fetchLocalNews(undefined, undefined, skip, take);
}

export async function getWorldNewsPage(topic: string, skip = 0, take = 10): Promise<NewsArticle[]> {
  return fetchWorldNews(topic, skip, take);
}

export async function getUnseenNews(
  seenIds: string[],
  take = 10
): Promise<NewsArticle[]> {
  const where: Record<string, unknown> = {
    published: true,
    status: "PUBLISHED",
  };
  if (seenIds.length > 0) {
    where.id = { notIn: seenIds };
  }

  const articles = await db.article.findMany({
    where: where as Record<string, unknown>,
    orderBy: { publishedAt: "desc" },
    include: {
      author: true,
      categories: true,
    },
    take,
  });

  return articles.map(mapPrismaArticle);
}
