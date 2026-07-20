"use server";

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
};

export async function syncWorldNews() {
  const apiKey = process.env.NEWS_API_KEY || process.env.MEDIASTACK_API_KEY;
  if (!apiKey) {
    return { success: false, error: "News API key is missing." };
  }

  try {
    // Global/international categories only — Sierra Leone content comes from
    // the dedicated scraper source (sync-scraper.ts).
    const worldEndpoints: SyncEndpoint[] = [
      { name: "International", endpoint: "latest-news", params: { category: "world", language: "en", page_size: "10" } },
      { name: "Africa", endpoint: "latest-news", params: { category: "world", language: "en", page_size: "10" } },
      { name: "Business", endpoint: "latest-news", params: { category: "business", language: "en", page_size: "10" } },
      { name: "Sports", endpoint: "latest-news", params: { category: "sports", language: "en", page_size: "10" } },
      { name: "Tech", endpoint: "latest-news", params: { category: "technology", language: "en", page_size: "10" } },
      { name: "Health", endpoint: "latest-news", params: { category: "health", language: "en", page_size: "10" } },
      { name: "Environment", endpoint: "latest-news", params: { category: "environment", language: "en", page_size: "10" } },
      { name: "Culture", endpoint: "latest-news", params: { category: "entertainment", language: "en", page_size: "10" } },
    ];

    let totalCount = 0;

    for (const endpoint of worldEndpoints) {
      const categoryName = endpoint.name;

      let category = await db.category.findUnique({
        where: { name: categoryName },
      });

      if (!category) {
        category = await db.category.create({ data: { name: categoryName } });
      }

      let res = await fetch(buildUrl(endpoint.endpoint, endpoint.params), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });

      let retries = 0;
      while (res.status === 429 && retries < 3) {
        console.warn(`Currents API rate-limited on ${endpoint.name}, backing off...`);
        await sleep(8000);
        res = await fetch(buildUrl(endpoint.endpoint, endpoint.params), {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: "no-store",
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

        const existing = await db.article.findFirst({
          where: { title: a.title },
          include: { categories: true },
        });

        if (existing) {
          const alreadyCategorized = existing.categories.some(
            (c: { id: string }) => c.id === category.id
          );
          if (!alreadyCategorized) {
            await db.article.update({
              where: { id: existing.id },
              data: { categories: { connect: { id: category.id } } },
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
              province: null,
              district: null,
              publishedAt: new Date(a.published?.replace(" +0000", "Z").replace(" ", "T") || new Date()),
              // Global articles are unattributed to the SL bot user pool is not
              // required; fall back to the news-bot author.
              authorId: (await getBotAuthorId()),
              categories: { connect: { id: category.id } },
            },
          });
          totalCount++;
        }
      }

      await sleep(2000);
    }

    return { success: true, count: totalCount };
  } catch (error: unknown) {
    console.error("Currents world ingestion error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function getBotAuthorId(): Promise<string> {
  const botUser = await db.user.findFirst({ where: { email: "news-bot@slnews.local" } });
  if (!botUser) {
    const { db: _db } = await import("@/lib/db");
    const created = await _db.user.create({
      data: {
        email: "news-bot@slnews.local",
        name: "News Bot",
        role: "WRITER",
        password: await import("bcryptjs").then((b) => b.default.hash(Math.random().toString(36), 10)),
      },
    });
    return created.id;
  }
  return botUser.id;
}
