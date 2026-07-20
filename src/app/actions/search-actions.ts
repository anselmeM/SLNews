"use server";

import { db } from "@/lib/db";
import { searchArticles } from "@/lib/news-service";

export async function instantSearch(query: string) {
  if (!query || query.length < 2) return [];

  const results = await searchArticles(query, 0, 5);

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
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
