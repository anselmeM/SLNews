"use server";

import { db } from "@/lib/db";
import type { NewsArticle } from "@/lib/news-service";
import { mapPrismaArticle, fetchMixedHomeFeed, fetchLocalNews, fetchWorldNews, LOCAL_FEED_CATEGORIES } from "@/lib/news-service";

export async function getPersonalizedNews(
  region: string | null,
  topics: string[],
  skip = 0,
  take = 10
): Promise<NewsArticle[]> {
  if (!region && (!topics || topics.length === 0)) {
    return fetchMixedHomeFeed(take);
  }

  const conditions: Record<string, unknown>[] = [];
  
  if (region) {
    conditions.push({ province: region });
    conditions.push({ district: region });
  }
  
  if (topics && topics.length > 0) {
    conditions.push({
      categories: {
        some: {
          name: { in: topics }
        }
      }
    });
  }

  const articles = await db.article.findMany({
    where: {
      published: true,
      status: "PUBLISHED",
      OR: conditions
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: true,
      categories: true,
    },
    skip,
    take,
  });

  // If the region filter matched nothing (articles lack region data),
  // fall back to topics-only, then to the mixed feed so users never
  // see an empty dead feed on the first page.
  if (articles.length === 0 && region) {
    return getPersonalizedNews(null, topics, skip, take);
  }
  if (articles.length === 0) {
    // Later pages: return [] so pagination ends cleanly instead of
    // re-serving page 1 (fetchMixedHomeFeed ignores `skip` and would
    // duplicate articles the client already has).
    if (skip > 0) return [];
    return fetchMixedHomeFeed(take);
  }

  // Sparse topic matches (e.g. following a topic with only a few stories)
  // used to dead-end the feed at 2-3 articles with no Load More button.
  // Pad the first page with general SL news so a personalized feed is
  // never a near-empty dead end.
  if (skip === 0 && articles.length < take) {
    const padArticles = await db.article.findMany({
      where: {
        published: true,
        status: "PUBLISHED",
        categories: { some: { name: { in: LOCAL_FEED_CATEGORIES } } },
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: true,
        categories: true,
      },
      take: take - articles.length,
    });
    const seen = new Set(articles.map((a) => a.id));
    for (const pad of padArticles) {
      if (seen.has(pad.id)) continue;
      articles.push(pad);
      seen.add(pad.id);
      if (articles.length >= take) break;
    }
  }

  return articles.map(mapPrismaArticle);
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
