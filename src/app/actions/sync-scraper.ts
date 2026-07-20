"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SCRAPER_BASE = "https://slnewsapiscapper.onrender.com/api/news";

function buildScraperUrl(): string {
  const key = process.env.SCRAPER_API_KEY;
  if (!key) {
    throw new Error("SCRAPER_API_KEY is not set");
  }
  return `${SCRAPER_BASE}?api_key=${encodeURIComponent(key)}`;
}

type ScraperArticle = {
  id?: number | string;
  title?: string;
  link?: string;
  author?: string;
  description?: string;
  category?: string[];
  imageUrl?: string;
  paragraphs?: string[];
  pubDate?: string;
  source?: string;
  createdAt?: string;
};

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

async function resolveCategories(names: string[]) {
  const resolved = await Promise.all(
    [...new Set(names.map(n => n.trim()).filter(Boolean))].map(async (name) => {
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

    const fallbackCategory = await db.category.upsert({
      where: { name: "National" },
      update: {},
      create: { name: "National" },
    });

    let res: Response;
    try {
      res = await fetch(buildScraperUrl(), { cache: "no-store" });
    } catch {
      return { success: false, error: "Scraper unreachable" };
    }

    if (!res.ok) {
      return { success: false, error: `Scraper responded ${res.status}` };
    }

    const raw = (await res.json()) as ScraperArticle[];
    if (!Array.isArray(raw)) {
      return { success: false, error: "Unexpected scraper payload" };
    }

    let totalCount = 0;

    for (const a of raw) {
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
