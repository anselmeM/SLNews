"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const API_BASE = "https://api.currentsapi.services/v1";

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

    // Clean stale bot articles older than 2 days (keep content fresh)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await db.article.deleteMany({
      where: { authorId: botUser.id, publishedAt: { lt: twoDaysAgo } }
    });

    const localEndpoints: SyncEndpoint[] = [
      { name: "Western Area", province: "Western Area", isLocal: true, endpoint: "search", params: { keywords: "Freetown", language: "en", page_size: "15" } },
      { name: "Western Area", province: "Western Area", isLocal: true, endpoint: "search", params: { keywords: "Sierra Leone capital", language: "en", page_size: "15" } },
      { name: "Southern", province: "Southern", isLocal: true, endpoint: "search", params: { keywords: "Bo district Sierra Leone", language: "en", page_size: "15" } },
      { name: "Eastern", province: "Eastern", isLocal: true, endpoint: "search", params: { keywords: "Kenema Sierra Leone", language: "en", page_size: "15" } },
      { name: "Northern", province: "Northern", isLocal: true, endpoint: "search", params: { keywords: "Makeni Sierra Leone", language: "en", page_size: "15" } },
      { name: "Local", province: null, isLocal: true, endpoint: "latest-news", params: { category: "world", language: "en", page_size: "15" } },
    ];

    const nationalEndpoints: SyncEndpoint[] = [
      { name: "National", endpoint: "search", params: { keywords: "Sierra Leone", language: "en", page_size: "30" } },
      { name: "National", endpoint: "search", params: { keywords: "Freetown government", language: "en", page_size: "15" } },
      { name: "National", endpoint: "search", params: { keywords: "Salone news", language: "en", page_size: "15" } },
      { name: "Politics", endpoint: "search", params: { keywords: "Sierra Leone parliament", language: "en", page_size: "15" } },
      { name: "Politics", endpoint: "latest-news", params: { category: "politics", language: "en", page_size: "15" } },
      { name: "Economy", endpoint: "search", params: { keywords: "Sierra Leone business development", language: "en", page_size: "15" } },
      { name: "Economy", endpoint: "latest-news", params: { category: "business", language: "en", page_size: "15" } },
      { name: "Education", endpoint: "search", params: { keywords: "Sierra Leone schools university", language: "en", page_size: "15" } },
      { name: "Education", endpoint: "latest-news", params: { category: "education", language: "en", page_size: "15" } },
    ];

    const worldEndpoints: SyncEndpoint[] = [
      { name: "International", endpoint: "latest-news", params: { category: "world", language: "en", page_size: "20" } },
      { name: "Africa", endpoint: "search", params: { keywords: "Africa news", language: "en", page_size: "20" } },
      { name: "Africa", endpoint: "search", params: { keywords: "West Africa ECOWAS", language: "en", page_size: "15" } },
      { name: "Business", endpoint: "latest-news", params: { category: "business", language: "en", page_size: "15" } },
      { name: "Sports", endpoint: "latest-news", params: { category: "sports", language: "en", page_size: "15" } },
      { name: "Tech", endpoint: "latest-news", params: { category: "technology", language: "en", page_size: "15" } },
      { name: "Health", endpoint: "latest-news", params: { category: "health", language: "en", page_size: "15" } },
      { name: "Environment", endpoint: "latest-news", params: { category: "environment", language: "en", page_size: "15" } },
      { name: "Culture", endpoint: "latest-news", params: { category: "entertainment", language: "en", page_size: "15" } },
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

      const res = await fetch(buildUrl(endpoint.endpoint, endpoint.params), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store"
      });
      if (res.status === 429) {
        console.warn(`Currents API rate-limited on ${endpoint.name}, waiting...`);
        await sleep(5000);
        continue;
      }
      if (!res.ok) {
        await sleep(1000);
        continue;
      }

      const data = await res.json();
      const articles = data.news || [];

      for (const a of articles) {
        if (!a.title || !a.url) continue;

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

      await sleep(1200);
    }

    return { success: true, count: totalCount };
  } catch (error: unknown) {
    console.error("Currents API Ingestion Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
