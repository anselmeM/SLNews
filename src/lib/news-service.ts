import type { Article, User, Category, Prisma } from "@prisma/client";
import { cachedFetch } from "./cache";
import { db } from "./db";

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  location?: string;
  source: string;
  sourceImage?: string;
  publishedAt: string;
  externalUrl?: string;
  authorId: string;
};

export type ArticleWithRelations = Article & {
  author: Pick<User, "name" | "image"> | null;
  categories: Pick<Category, "name">[];
};

export function mapPrismaArticle(article: ArticleWithRelations): NewsArticle {
  const categoryName = article.categories?.[0]?.name || "National";

  let sourceName = article.author?.name || "SLNews Contributor";
  if (sourceName === "News Bot") {
    const match = article.content?.match(/Source: (.+?) —/);
    if (match?.[1]) sourceName = match[1].trim();
  }

  return {
    id: article.id,
    title: article.title,
    summary: article.summary || "",
    content: article.content,
    imageUrl: article.imageUrl || "/globe.svg",
    category: categoryName,
    location: article.district || article.province || undefined,
    source: sourceName,
    sourceImage: article.author?.image || undefined,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : article.createdAt.toISOString(),
    authorId: article.authorId,
  };
}

const DEFAULT_PAGE_SIZE = 10;
const TTL = { feed: 30, single: 60 };

export async function fetchSLNews(region?: string, topic?: string, skip = 0, take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  return cachedFetch(`slnews:${region}:${topic}:${skip}:${take}`, async () => {
    const categoryNames = topic ? [topic] : ["Local", "National", "Politics", "Economy", "Education"];
    const where: Prisma.ArticleWhereInput = { published: true, status: "PUBLISHED", categories: { some: { name: { in: categoryNames } } } };
    if (region) where.province = region;
    const articles = await db.article.findMany({ where, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, skip, take });
    return articles.map(mapPrismaArticle);
  }, TTL.feed);
}

export async function fetchMixedHomeFeed(take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  return cachedFetch(`home:${take}`, async () => {
    const half = Math.ceil(take / 2);
    const local = await db.article.findMany({ where: { published: true, status: "PUBLISHED", categories: { some: { name: "Local" } } }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, take: half });
    const national = await db.article.findMany({ where: { published: true, status: "PUBLISHED", categories: { some: { name: { in: ["National", "Politics", "Economy", "Education"] } } } }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, take: half });
    const allLocal = local.map(mapPrismaArticle);
    const allNational = national.map(mapPrismaArticle);
    const mixed: NewsArticle[] = [];
    let li = 0, ni = 0;
    while (mixed.length < take && (li < allLocal.length || ni < allNational.length)) {
      const localItem = allLocal[li]; if (localItem) mixed.push(localItem); li++;
      const nationalItem = allNational[ni]; if (nationalItem && mixed.length < take) mixed.push(nationalItem); ni++;
    }
    return mixed;
  }, TTL.feed);
}

export async function fetchTrendingNews(skip = 0, take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  return cachedFetch(`trending:${skip}:${take}`, async () => {
    const articles = await db.article.findMany({ where: { published: true, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, skip, take });
    return articles.map(mapPrismaArticle);
  }, 60);
}

export async function fetchLocalNews(province?: string, district?: string, skip = 0, take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  return cachedFetch(`local:${province}:${district}:${skip}:${take}`, async () => {
    const where: Record<string, unknown> = { published: true, status: "PUBLISHED", categories: { some: { name: { in: ["Local"] } } } };
    if (province) where.province = province;
    if (district) where.district = district;
    const articles = await db.article.findMany({ where, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, skip, take });
    return articles.map(mapPrismaArticle);
  }, TTL.feed);
}

export async function fetchWorldNews(topic?: string, skip = 0, take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  return cachedFetch(`world:${topic}:${skip}:${take}`, async () => {
    const categoryName = (topic && topic !== "World") ? topic : "International";
    const articles = await db.article.findMany({ where: { published: true, status: "PUBLISHED", categories: { some: { name: categoryName } } }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, skip, take });
    return articles.map(mapPrismaArticle);
  }, TTL.feed);
}

export async function fetchNationalNews(category = "National", skip = 0, take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  return cachedFetch(`national:${category}:${skip}:${take}`, async () => {
    const articles = await db.article.findMany({ where: { published: true, status: "PUBLISHED", categories: { some: { name: category } } }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, skip, take });
    return articles.map(mapPrismaArticle);
  }, TTL.feed);
}

export async function fetchArticleById(id: string): Promise<NewsArticle | null> {
  return cachedFetch(`article:${id}`, async () => {
    const article = await db.article.findUnique({ where: { id }, include: { author: true, categories: true } });
    if (!article) return null;
    return mapPrismaArticle(article);
  }, TTL.single);
}

export async function searchArticles(query: string, skip = 0, take = DEFAULT_PAGE_SIZE): Promise<NewsArticle[]> {
  const sanitized = query.trim().slice(0, 200);
  if (!sanitized) return [];
  // Searches are user-specific — short TTL to avoid stale cache on repeat queries
  return cachedFetch(`search:${sanitized}:${skip}:${take}`, async () => {
    const articles = await db.article.findMany({ where: { published: true, status: "PUBLISHED", OR: [{ title: { contains: sanitized, mode: "insensitive" } }, { summary: { contains: sanitized, mode: "insensitive" } }, { content: { contains: sanitized, mode: "insensitive" } }] }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, skip, take });
    return articles.map(mapPrismaArticle);
  }, 15);
}

export async function fetchRelatedArticles(excludeId: string, category: string, take = 4): Promise<NewsArticle[]> {
  return cachedFetch(`related:${excludeId}:${category}:${take}`, async () => {
    const articles = await db.article.findMany({ where: { id: { not: excludeId }, published: true, status: "PUBLISHED", categories: { some: { name: category } } }, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true }, take });
    return articles.map(mapPrismaArticle);
  }, TTL.single);
}
