import { SL_TOPICS } from "./constants";
import { db } from "./db";

/**
 * How many saved stories contribute to the interest profile. Saving is a
 * long-tail signal, so the most recent saves are the best description of what
 * the reader currently cares about — and the cap keeps the category lookup one
 * indexed `IN` query rather than an unbounded one.
 */
export const MAX_INTEREST_SOURCES = 50;

const LEGACY_TOPIC_MAP: Record<string, string> = { Technology: "Tech" };

/**
 * Topics were renamed in 1dea548 ("Technology" -> "Tech"). Normalize any legacy
 * value and drop anything the app does not offer as a topic, so a stale
 * selection can never rank the feed by a category that does not exist.
 */
export function normalizeTopics(topics: readonly string[]): string[] {
  const mapped = topics.map((topic) => LEGACY_TOPIC_MAP[topic] ?? topic);
  return [...new Set(mapped)].filter((topic) => SL_TOPICS.includes(topic));
}

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

/**
 * The categories the feed should rank for a reader: the topics they explicitly
 * follow, plus the categories of the stories they chose to save.
 *
 * Topics were previously only read by the briefing card (which renamed its
 * title and scored the digest), so following "Tech" left the actual feed
 * untouched. Both signals now reach the same `rankFeedByInterest` call.
 */
export async function feedInterestCategories(userId: string): Promise<Set<string>> {
  if (!userId) return new Set();

  const [user, saved] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { preferredTopics: true },
    }),
    savedInterestCategories(userId),
  ]);

  const categories = new Set(saved);
  for (const topic of normalizeTopics(user?.preferredTopics ?? [])) {
    categories.add(topic);
  }
  return categories;
}
