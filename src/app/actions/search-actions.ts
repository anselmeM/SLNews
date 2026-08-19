"use server";

import { db } from "@/lib/db";
import { searchArticles } from "@/lib/news-service";

export type InstantSearchResult = {
  id: string;
  title: string;
  category: string;
  source: string;
  publishedAt: string;
  imageUrl?: string | null;
};

export async function instantSearch(query: string): Promise<InstantSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const results = await searchArticles(trimmed, 0, 6);

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    source: r.source,
    publishedAt: r.publishedAt,
    imageUrl: r.imageUrl,
  }));
}

export async function getTrendingTopics(): Promise<string[]> {
  const categories = await db.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { articles: { _count: "desc" } },
    take: 6,
  });

  return categories.map((c) => c.name);
}
