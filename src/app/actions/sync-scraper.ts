"use server";

import bcrypt from "bcryptjs";
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

// The scraper's category names don't always match the app's categories
// ("Local" was merged into "National", and the scraper uses "Politics & Law"
// / "Economy & Business" instead of "Politics"/"Economy"). Normalize them so
// every article lands in a category that actually shows in the feeds.
const CATEGORY_ALIASES: Record<string, string> = {
  Local: "National",
  District: "National",
  Provincial: "National",
  Opinion: "National",
  "In Focus": "National",
  "Politics & Law": "Politics",
  "Economy & Business": "Economy",
};

async function resolveCategories(names: string[]) {
  const resolved = await Promise.all(
    [...new Set(names.map(n => n.trim()).filter(Boolean))].map(async (raw) => {
      const name = CATEGORY_ALIASES[raw] ?? raw;
      const cat = await db.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      return { id: cat.id };
    })
  );
  return resolved;
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

    let totalCount = 0;

    for (const a of articles) {
      const title = a.title?.trim();
      const link = a.link?.trim();
      if (!title || !link) continue;

      const byline = [a.author, a.source].filter(Boolean).join(" for ") || "SLNews";
      const paragraphs = Array.isArray(a.paragraphs) ? a.paragraphs : [];
      const body = paragraphs.join("\n\n").trim() || "Read full article on source.";
      const content = `${body}\n\nSource: ${byline} — ${link}`;
      const summary = paragraphs[0]?.slice(0, 280) || title;

      const publishedAt = a.pubDate
        ? new Date(a.pubDate)
        : a.createdAt
          ? new Date(a.createdAt)
          : new Date();

      const categoryNames = (Array.isArray(a.category) && a.category.length > 0)
        ? a.category
        : ["National"];
      const categories = await resolveCategories(categoryNames);

      const existing = await db.article.findFirst({
        where: { title },
        include: { categories: true },
      });

      if (existing) {
        const existingNames = existing.categories.map((c: { name: string }) => c.name);
        const missingNames = categoryNames.filter(n => !existingNames.includes(n));
        const needsImage = (!existing.imageUrl || existing.imageUrl === "/globe.svg") && a.imageUrl?.trim();
        const needsSummary = !existing.summary && summary !== title;

        const updateData: Record<string, unknown> = {};
        if (missingNames.length > 0) {
          const missing = await resolveCategories(missingNames);
          updateData.categories = { connect: missing.map(c => ({ id: c.id })) };
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
          categories: { connect: categories },
        },
      });
      totalCount++;
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
