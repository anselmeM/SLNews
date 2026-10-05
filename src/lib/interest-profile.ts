import { db } from "./db";

/**
 * How many saved stories contribute to the interest profile. Saving is a
 * long-tail signal, so the most recent saves are the best description of what
 * the reader currently cares about — and the cap keeps the category lookup one
 * indexed `IN` query rather than an unbounded one.
 */
export const MAX_INTEREST_SOURCES = 50;

/**
 * Category names the reader has shown interest in, derived from saved stories.
 * Saved ids that no longer resolve to an article (deleted story) simply
 * contribute nothing, and an empty input never touches the database — that is
 * the zero-saves path the home feed still renders correctly.
 */
export async function interestCategoriesFromArticleIds(
  articleIds: readonly string[]
): Promise<Set<string>> {
  // Callers pass newest-first where the order is meaningful; the cap is a
  // guard against an unbounded client-supplied list, not a recency rule.
  const ids = [...new Set(articleIds)].filter(Boolean).slice(0, MAX_INTEREST_SOURCES);
  if (ids.length === 0) return new Set();

  const rows = await db.article.findMany({
    where: { id: { in: ids } },
    select: { categories: { select: { name: true } } },
  });

  const categories = new Set<string>();
  for (const row of rows) {
    for (const category of row.categories) categories.add(category.name);
  }
  return categories;
}

/** Interest profile for a signed-in reader, from their saved articles. */
export async function savedInterestCategories(userId: string): Promise<Set<string>> {
  if (!userId) return new Set();

  const saved = await db.savedArticle.findMany({
    where: { userId },
    select: { articleId: true },
    orderBy: { createdAt: "desc" },
    take: MAX_INTEREST_SOURCES,
  });

  return interestCategoriesFromArticleIds(saved.map((s) => s.articleId));
}
