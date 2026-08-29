"use server";

import { db } from "@/lib/db";

export interface ReelVideo {
  id: string;
  title: string;
  summary: string;
  videoUrl: string;
  thumbnailUrl: string;
  source: string;
  sourceImage?: string;
  category: string;
  location?: string;
  publishedAt: string;
  authorId: string;
  commentsCount?: number;
}

// Curated high-quality Sierra Leone news video shorts & reels
// representing top broadcaster and social media channels.
const CURATED_SL_REELS: ReelVideo[] = [
  {
    id: "reel-ayv-freetown-port",
    title: "Freetown Port Deep-Water Expansion Project Commissioned",
    summary:
      "Presidential commission of the new multi-million dollar container terminal at Queen Elizabeth II Quay in Freetown, enhancing West African maritime trade.",
    videoUrl: "https://www.youtube.com/shorts/3f4Y2N4w1bY",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    source: "AYV News Sierra Leone",
    sourceImage: "/globe.svg",
    category: "Economy",
    location: "Freetown",
    publishedAt: new Date().toISOString(),
    authorId: "ayv-news",
    commentsCount: 14,
  },
  {
    id: "reel-parliament-energy-bill",
    title: "Parliament Approves Rural Solar Microgrid Energy Expansion",
    summary:
      "Debate in Parliament as MPs unanimously enact the Renewable Off-Grid Bill to connect over 40 rural chiefdoms across Tonkolili and Koinadugu.",
    videoUrl: "https://www.youtube.com/shorts/5e_0zN9fQ4w",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
    source: "Parliament Watch SL",
    sourceImage: "/globe.svg",
    category: "Politics",
    location: "National",
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    authorId: "parliament-watch",
    commentsCount: 22,
  },
  {
    id: "reel-kenema-cocoa-harvest",
    title: "Eastern Province Cocoa Farmers Record Highest Yield in 5 Years",
    summary:
      "Cocoa cooperatives in Kenema and Kailahun report unprecedented organic export volumes following sustainable farming initiatives.",
    videoUrl: "https://www.youtube.com/shorts/8b1M6j2x9Lg",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80",
    source: "Switsalone Media",
    sourceImage: "/globe.svg",
    category: "Agriculture",
    location: "Kenema",
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    authorId: "switsalone",
    commentsCount: 9,
  },
  {
    id: "reel-leone-currency-update",
    title: "Bank of Sierra Leone FX Operations & Currency Stability Update",
    summary:
      "Governor of the Bank of Sierra Leone delivers quarterly monetary briefing on Leone reserves and inflation curbing measures.",
    videoUrl: "https://www.youtube.com/shorts/9z3P1x8k7Lw",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    source: "SierraLoaded",
    sourceImage: "/globe.svg",
    category: "Economy",
    location: "Freetown",
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    authorId: "sierraloaded",
    commentsCount: 31,
  },
  {
    id: "reel-leone-stars-qualifier",
    title: "Leone Stars Final Training Camp Ahead of AFCON Qualifiers",
    summary:
      "Sierra Leone national football team conducts intensive drills at the Siaka Stevens Stadium in Freetown with international squad arrivals.",
    videoUrl: "https://www.youtube.com/shorts/2k4M7v1z8Lw",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    source: "SLBC Sports",
    sourceImage: "/globe.svg",
    category: "Sports",
    location: "Freetown",
    publishedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    authorId: "slbc-sports",
    commentsCount: 45,
  },
];

export async function fetchReelsFeed(skip = 0, take = 10): Promise<ReelVideo[]> {
  try {
    // Check if database has articles with video/reel references
    const articles = await db.article.findMany({
      where: {
        published: true,
        status: "PUBLISHED",
        OR: [
          { content: { contains: "youtube.com" } },
          { content: { contains: "facebook.com" } },
          { content: { contains: "instagram.com" } },
          { content: { contains: "tiktok.com" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: true,
        categories: true,
        _count: { select: { comments: true } },
      },
      skip,
      take,
    });

    const dbReels: ReelVideo[] = [];

    for (const a of articles) {
      const videoMatch = a.content.match(
        /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch|tiktok\.com)\/[^\s<>"]+/i
      );
      if (videoMatch?.[0]) {
        dbReels.push({
          id: a.id,
          title: a.title,
          summary: a.summary || a.content.slice(0, 160),
          videoUrl: videoMatch[0],
          thumbnailUrl: a.imageUrl || "/globe.svg",
          source: a.author?.name || "SLNews Contributor",
          sourceImage: a.author?.image || undefined,
          category: a.categories?.[0]?.name || "National",
          location: a.district || a.province || undefined,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
          authorId: a.authorId,
          commentsCount: a._count?.comments || 0,
        });
      }
    }

    // Blend with curated Sierra Leone news reels
    const allReels = [...dbReels, ...CURATED_SL_REELS];
    return allReels.slice(skip, skip + take);
  } catch {
    return CURATED_SL_REELS.slice(skip, skip + take);
  }
}

export async function getReelById(id: string): Promise<ReelVideo | null> {
  const curated = CURATED_SL_REELS.find((r) => r.id === id);
  if (curated) return curated;

  try {
    const a = await db.article.findUnique({
      where: { id },
      include: {
        author: true,
        categories: true,
        _count: { select: { comments: true } },
      },
    });
    if (!a) return null;

    const videoMatch = a.content.match(
      /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch|tiktok\.com)\/[^\s<>"]+/i
    );

    return {
      id: a.id,
      title: a.title,
      summary: a.summary || a.content.slice(0, 160),
      videoUrl: videoMatch?.[0] || "https://www.youtube.com/shorts/3f4Y2N4w1bY",
      thumbnailUrl: a.imageUrl || "/globe.svg",
      source: a.author?.name || "SLNews Contributor",
      sourceImage: a.author?.image || undefined,
      category: a.categories?.[0]?.name || "National",
      location: a.district || a.province || undefined,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
      authorId: a.authorId,
      commentsCount: a._count?.comments || 0,
    };
  } catch {
    return null;
  }
}
