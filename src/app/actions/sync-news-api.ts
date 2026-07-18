"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const API_BASE = "https://api.currentsapi.services/v1";

// Keywords that signal an article is actually about Sierra Leone / Freetown.
const SL_RELEVANCE = /sierra leone|freetown|salone|bo district|kenema|makeni|port loko|koidu|kailahun|tonkolili|mogbwemo|pujehun|bonthe|kambia|slpp|apc|maada bio|julius bio|awoko|concords|the patriot|eye 11|salone times|standard times|rainbo|ebola|western area/i;

// Categories that are inherently global — safe to fill from latest-news.
const GLOBAL_CATEGORIES = new Set([
  "International",
  "Sports",
  "Tech",
  "Health",
  "Business",
  "Culture",
  "Environment",
]);

function isSierraLeoneRelated(a: { title?: string; description?: string }): boolean {
  const text = `${a.title || ""} ${a.description || ""}`;
  return SL_RELEVANCE.test(text);
}

function buildUrl(endpoint: string, params: Record<string, string>): string {
  const sp = new URLSearchParams(params);
  return `${API_BASE}/${endpoint}?${sp}`;
}

type SyncEndpoint = {
  name: string;
  endpoint: string;
  params: Record<string, string>;
  province?: string | null;
  isLocal?: boolean;
};

export async function syncNewsAPI() {
  const apiKey = process.env.MEDIASTACK_API_KEY || process.env.NEWS_API_KEY;
  if (!apiKey) {
    return { success: false, error: "News API key is missing." };
  }

  try {
    let botUser = await db.user.findFirst({
      where: { email: "news-bot@slnews.local" }
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
          password: hashedPassword
        }
      });
    }

    // Migrate old mediastack-bot if exists
    const oldBot = await db.user.findUnique({ where: { email: "mediastack-bot@slnews.local" } });
    if (oldBot && oldBot.id !== botUser.id) {
      await db.article.updateMany({ where: { authorId: oldBot.id }, data: { authorId: botUser.id } });
      await db.user.delete({ where: { id: oldBot.id } });
    }

    // Clean stale bot articles older than 2 days (keep content fresh and
    // survive partial/rate-limited syncs instead of wiping everything).
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await db.article.deleteMany({
      where: { authorId: botUser.id, publishedAt: { lt: twoDaysAgo } }
    });

    const localEndpoints: SyncEndpoint[] = [
      { name: "Western Area", province: "Western Area", isLocal: true, endpoint: "search", params: { keywords: "Freetown Sierra Leone", language: "en", page_size: "10" } },
      { name: "Western Area", province: "Western Area", isLocal: true, endpoint: "search", params: { keywords: "Freetown news", language: "en", page_size: "10" } },
      { name: "Southern", province: "Southern", isLocal: true, endpoint: "search", params: { keywords: "Bo Sierra Leone", language: "en", page_size: "10" } },
      { name: "Eastern", province: "Eastern", isLocal: true, endpoint: "search", params: { keywords: "Kenema Sierra Leone", language: "en", page_size: "10" } },
      { name: "Northern", province: "Northern", isLocal: true, endpoint: "search", params: { keywords: "Makeni Sierra Leone", language: "en", page_size: "10" } },
    ];

    const nationalEndpoints: SyncEndpoint[] = [
      { name: "National", endpoint: "search", params: { keywords: "Sierra Leone", language: "en", page_size: "10" } },
      { name: "National", endpoint: "search", params: { keywords: "Sierra Leone news", language: "en", page_size: "10" } },
      { name: "National", endpoint: "search", params: { keywords: "Freetown", language: "en", page_size: "10" } },
      { name: "Politics", endpoint: "search", params: { keywords: "Sierra Leone government parliament", language: "en", page_size: "10" } },
      { name: "Politics", endpoint: "search", params: { keywords: "Sierra Leone election", language: "en", page_size: "10" } },
      { name: "Economy", endpoint: "search", params: { keywords: "Sierra Leone economy business", language: "en", page_size: "10" } },
      { name: "Economy", endpoint: "search", params: { keywords: "Sierra Leone mining", language: "en", page_size: "10" } },
      { name: "Education", endpoint: "search", params: { keywords: "Sierra Leone schools university", language: "en", page_size: "10" } },
      { name: "Education", endpoint: "search", params: { keywords: "Sierra Leone education", language: "en", page_size: "10" } },
    ];

    const worldEndpoints: SyncEndpoint[] = [
      { name: "International", endpoint: "latest-news", params: { category: "world", language: "en", page_size: "10" } },
      { name: "Africa", endpoint: "search", params: { keywords: "Sierra Leone Africa", language: "en", page_size: "10" } },
      { name: "Africa", endpoint: "search", params: { keywords: "West Africa ECOWAS", language: "en", page_size: "10" } },
      { name: "Business", endpoint: "latest-news", params: { category: "business", language: "en", page_size: "10" } },
      { name: "Sports", endpoint: "latest-news", params: { category: "sports", language: "en", page_size: "10" } },
      { name: "Tech", endpoint: "latest-news", params: { category: "technology", language: "en", page_size: "10" } },
      { name: "Health", endpoint: "latest-news", params: { category: "health", language: "en", page_size: "10" } },
      { name: "Environment", endpoint: "latest-news", params: { category: "environment", language: "en", page_size: "10" } },
      { name: "Culture", endpoint: "latest-news", params: { category: "entertainment", language: "en", page_size: "10" } },
    ];

    const allEndpoints = [...localEndpoints, ...nationalEndpoints, ...worldEndpoints];

    let totalCount = 0;

    for (const endpoint of allEndpoints) {
      const categoryName = endpoint.isLocal ? "Local" : endpoint.name;

      let category = await db.category.findUnique({
        where: { name: categoryName }
      });

      if (!category) {
        category = await db.category.create({
          data: { name: categoryName }
        });
      }

      let res = await fetch(buildUrl(endpoint.endpoint, endpoint.params), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store"
      });

      // Retry up to 3x on rate-limit instead of skipping the endpoint.
      let retries = 0;
      while (res.status === 429 && retries < 3) {
        console.warn(`Currents API rate-limited on ${endpoint.name}, backing off...`);
        await sleep(8000);
        res = await fetch(buildUrl(endpoint.endpoint, endpoint.params), {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: "no-store"
        });
        retries++;
      }
      if (!res.ok) {
        await sleep(1000);
        continue;
      }

      const data = await res.json();
      const articles = data.news || [];

      for (const a of articles) {
        if (!a.title || !a.url) continue;

        // For Sierra Leone–specific categories, only keep articles that
        // actually mention Sierra Leone / Freetown. Global categories
        // (Sports, Tech, etc.) are filled from latest-news and skipped.
        const isGlobal = GLOBAL_CATEGORIES.has(categoryName);
        if (!isGlobal && !isSierraLeoneRelated(a)) continue;

        const existing = await db.article.findFirst({
          where: { title: a.title },
          include: { categories: true }
        });

        if (existing) {
          const alreadyCategorized = existing.categories.some(
            (c: { id: string }) => c.id === category.id
          );
          if (!alreadyCategorized) {
            await db.article.update({
              where: { id: existing.id },
              data: {
                categories: { connect: { id: category.id } }
              }
            });
            totalCount++;
          }
        } else {
          await db.article.create({
            data: {
              title: a.title,
              summary: a.description || "",
              content: a.description || "Read full article on source.",
              imageUrl: a.image || "/globe.svg",
              published: true,
              status: "PUBLISHED",
              province: endpoint.province || null,
              district: null,
              publishedAt: new Date(a.published?.replace(" +0000", "Z").replace(" ", "T") || new Date()),
              authorId: botUser.id,
              categories: {
                connect: { id: category.id }
              }
            }
          });
          totalCount++;
        }
      }

      await sleep(2000);
    }

    return { success: true, count: totalCount };
  } catch (error: unknown) {
    console.error("Currents API Ingestion Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
