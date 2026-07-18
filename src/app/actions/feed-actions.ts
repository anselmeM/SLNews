"use server";

import { db } from "@/lib/db";
import type { NewsArticle } from "@/lib/news-service";
import { mapPrismaArticle, fetchMixedHomeFeed } from "@/lib/news-service";

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

  return articles.map(mapPrismaArticle);
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
