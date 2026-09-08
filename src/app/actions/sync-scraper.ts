"use server";

import bcrypt from "bcryptjs";
import { invalidate } from "@/lib/cache";
import { normalizeCategory } from "@/lib/category-constants";
import { db } from "@/lib/db";
import { fetchScraperNews, ScraperUnreachableError, type ScraperArticle } from "@/lib/scraper-client";

async function getBotUser() {
  let botUser = await db.user.findFirst({
    where: { email: "news-bot@slnews.local" },
  });

  if (!botUser) {
    const hashedPassword = await bcrypt.hash(
      process.env.SYNC_BOT_PASSWORD || crypto.randomUUID(),
      10
    );
    botUser = await db.user.create({
      data: {
        email: "news-bot@slnews.local",
        name: "News Bot",
        role: "WRITER",
        password: hashedPassword,
      },
    });
  }
  return botUser;
}

export async function syncFromScraper() {
  try {
    const botUser = await getBotUser();

    let articles: ScraperArticle[];
    try {
      articles = await fetchScraperNews();
    } catch (error) {
      if (error instanceof ScraperUnreachableError) {
        return { success: false, error: "Scraper unreachable" };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown scraper error",
      };
    }

    const validArticles = articles.filter(
      (a) => a.title?.trim() && a.link?.trim()
    );

    if (validArticles.length === 0) {
      return { success: true, count: 0 };
    }

    // 1. Batch-resolve and cache all unique categories in memory
    const rawCategorySet = new Set<string>();
    rawCategorySet.add("National");

    for (const a of validArticles) {
      const catList =
        Array.isArray(a.category) && a.category.length > 0
          ? a.category
          : ["National"];
      for (const c of catList) {
        if (c?.trim()) {
          rawCategorySet.add(normalizeCategory(c.trim()));
        }
      }
    }

    const categoryMap = new Map<string, string>();
    await Promise.all(
      [...rawCategorySet].map(async (name) => {
        const cat = await db.category.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        categoryMap.set(name, cat.id);
      })
    );

    // 2. Batch-check existing articles by title in a single query
    const titles = validArticles.map((a) => a.title!.trim());
    const existingArticles = await db.article.findMany({
      where: { title: { in: titles } },
      include: { categories: true },
    });

    const existingByTitle = new Map<string, (typeof existingArticles)[0]>();
    for (const item of existingArticles) {
      existingByTitle.set(item.title, item);
    }

    let totalCount = 0;

    for (const a of validArticles) {
      const title = a.title!.trim();
      const link = a.link!.trim();

      const byline =
        [a.author, a.source].filter(Boolean).join(" for ") || "SLNews";
      const paragraphs = Array.isArray(a.paragraphs) ? a.paragraphs : [];
      const body =
        paragraphs.join("\n\n").trim() || "Read full article on source.";
      const content = `${body}\n\nSource: ${byline} — ${link}`;
      const summary = paragraphs[0]?.slice(0, 280) || title;

      const publishedAt = a.pubDate
        ? new Date(a.pubDate)
        : a.createdAt
          ? new Date(a.createdAt)
          : new Date();

      const rawCategoryList =
        Array.isArray(a.category) && a.category.length > 0
          ? a.category
          : ["National"];

      const resolvedCategoryIds = [
        ...new Set(
          rawCategoryList.map((c) =>
            categoryMap.get(normalizeCategory(c.trim()))
          )
        ),
      ].filter((id): id is string => Boolean(id));

      const existing = existingByTitle.get(title);

      if (existing) {
        const missingIds = resolvedCategoryIds.filter(
          (id) =>
            !existing.categories.some((c: { id: string }) => c.id === id)
        );
        const needsImage =
          (!existing.imageUrl || existing.imageUrl === "/globe.svg") &&
          a.imageUrl?.trim();
        const needsSummary = !existing.summary && summary !== title;

        const updateData: Record<string, unknown> = {};
        if (missingIds.length > 0) {
          updateData.categories = {
            connect: missingIds.map((id) => ({ id })),
          };
        }
        if (needsImage) updateData.imageUrl = a.imageUrl!.trim();
        if (needsSummary) updateData.summary = summary;

        if (Object.keys(updateData).length > 0) {
          await db.article.update({
            where: { id: existing.id },
            data: updateData as Parameters<typeof db.article.update>[0]["data"],
          });
          totalCount++;
        }
        continue;
      }

      await db.article.create({
        data: {
          title,
          summary,
          content,
          imageUrl: a.imageUrl?.trim() || "/globe.svg",
          published: true,
          status: "PUBLISHED",
          province: null,
          district: null,
          publishedAt,
          authorId: botUser.id,
          categories: {
            connect: resolvedCategoryIds.map((id) => ({ id })),
          },
        },
      });
      totalCount++;
    }

    // Invalidate stale feed caches if articles were ingested/updated
    if (totalCount > 0) {
      invalidate("home:");
      invalidate("slnews:");
      invalidate("trending:");
      invalidate("local:");
    }

    return { success: true, count: totalCount };
  } catch (error: unknown) {
    console.error("Scraper ingestion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
