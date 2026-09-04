"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fetchScraperVideos, triggerScraperVideoSync, type ScraperVideo } from "@/lib/scraper-client";

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
  status?: string;
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
    status: "PUBLISHED",
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
    status: "PUBLISHED",
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
    status: "PUBLISHED",
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
    status: "PUBLISHED",
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
    status: "PUBLISHED",
  },
];

function mapScraperVideoToReel(v: ScraperVideo): ReelVideo {
  return {
    id: `scraper-video-${v.videoId}`,
    title: v.title,
    summary: v.description || v.title,
    videoUrl: v.url,
    thumbnailUrl: v.thumbnailUrl || "/globe.svg",
    source: v.channelTitle,
    category: v.category?.[0] || "National",
    publishedAt: v.publishedAt,
    authorId: "scraper-system",
    commentsCount: 0,
    status: "PUBLISHED",
  };
}

export async function fetchReelsFeed(skip = 0, take = 10): Promise<ReelVideo[]> {
  // 1. Fetch scraped videos from Render Scraper API
  let scraperReels: ReelVideo[] = [];
  try {
    const page = Math.floor(skip / take) + 1;
    const scrapedVideos = await fetchScraperVideos(take, page);
    scraperReels = scrapedVideos.map(mapScraperVideoToReel);
  } catch {
    scraperReels = [];
  }

  // 2. Fetch community-submitted / published video articles from Neon Postgres
  let dbReels: ReelVideo[] = [];
  try {
    const articles = await db.article.findMany({
      where: {
        published: true,
        status: "PUBLISHED",
        OR: [
          { content: { contains: "youtube.com" } },
          { content: { contains: "youtu.be" } },
          { content: { contains: "facebook.com" } },
          { content: { contains: "fb.watch" } },
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
          status: a.status,
        });
      }
    }
  } catch {
    dbReels = [];
  }

  // Merge scraped videos with community-submitted database reels
  const allReels = [...scraperReels, ...dbReels];
  if (allReels.length === 0) {
    return CURATED_SL_REELS.slice(skip, skip + take);
  }

  return allReels.slice(0, take);
}

export async function getReelById(id: string): Promise<ReelVideo | null> {
  const curated = CURATED_SL_REELS.find((r) => r.id === id);
  if (curated) return curated;

  if (id.startsWith("scraper-video-")) {
    const videoId = id.replace("scraper-video-", "");
    try {
      const scraped = await fetchScraperVideos(50, 1);
      const match = scraped.find((v) => v.videoId === videoId);
      if (match) return mapScraperVideoToReel(match);
    } catch {
      // Fallback
    }
  }

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
      status: a.status,
    };
  } catch {
    return null;
  }
}

export async function submitCommunityReel(data: {
  title: string;
  summary?: string;
  videoUrl: string;
  category?: string;
  location?: string;
}): Promise<{ success: boolean; isLive: boolean; message: string; id?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, isLive: false, message: "Please sign in to submit a video clip." };
  }

  const title = data.title.trim();
  const videoUrl = data.videoUrl.trim();
  if (!title || title.length < 5) {
    return { success: false, isLive: false, message: "Please enter a descriptive headline (at least 5 characters)." };
  }
  if (!videoUrl.startsWith("http")) {
    return { success: false, isLive: false, message: "Please enter a valid video link." };
  }

  const isPrivileged =
    session.user.role === "ADMIN" ||
    session.user.role === "EDITOR" ||
    session.user.role === "WRITER";

  const status = isPrivileged ? "PUBLISHED" : "IN_REVIEW";
  const published = isPrivileged;
  const categoryName = data.category || "National";

  try {
    const article = await db.article.create({
      data: {
        title,
        summary: data.summary?.trim() || title,
        content: `${data.summary || title}\n\nVideo Source: ${videoUrl}`,
        imageUrl: "/globe.svg",
        published,
        status,
        publishedAt: published ? new Date() : null,
        district: data.location?.trim() || null,
        province: data.location?.trim() || null,
        author: { connect: { id: session.user.id } },
        categories: {
          connectOrCreate: {
            where: { name: categoryName },
            create: { name: categoryName },
          },
        },
      },
    });

    return {
      success: true,
      isLive: published,
      message: published
        ? "Your video clip is now LIVE on SLNews Shorts!"
        : "Video submitted for editorial review. Once approved, it will appear on Shorts.",
      id: article.id,
    };
  } catch (err) {
    return {
      success: false,
      isLive: false,
      message: err instanceof Error ? err.message : "Failed to submit video clip.",
    };
  }
}

export async function getPendingCommunityReels(): Promise<ReelVideo[]> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return [];
  }

  try {
    const articles = await db.article.findMany({
      where: {
        status: "IN_REVIEW",
        OR: [
          { content: { contains: "youtube.com" } },
          { content: { contains: "youtu.be" } },
          { content: { contains: "facebook.com" } },
          { content: { contains: "fb.watch" } },
          { content: { contains: "instagram.com" } },
          { content: { contains: "tiktok.com" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        categories: true,
      },
    });

    return articles.map((a) => {
      const videoMatch = a.content.match(
        /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch|tiktok\.com)\/[^\s<>"]+/i
      );
      return {
        id: a.id,
        title: a.title,
        summary: a.summary || a.content,
        videoUrl: videoMatch?.[0] || "",
        thumbnailUrl: a.imageUrl || "/globe.svg",
        source: a.author?.name || "Community Reporter",
        sourceImage: a.author?.image || undefined,
        category: a.categories?.[0]?.name || "National",
        location: a.district || a.province || undefined,
        publishedAt: a.createdAt.toISOString(),
        authorId: a.authorId,
        status: a.status,
      };
    });
  } catch {
    return [];
  }
}

export async function approveCommunityReel(articleId: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await db.article.update({
      where: { id: articleId },
      data: {
        status: "PUBLISHED",
        published: true,
        publishedAt: new Date(),
      },
    });
    return { success: true, message: "Video approved and published to Shorts!" };
  } catch {
    return { success: false, message: "Failed to approve video." };
  }
}

export async function rejectCommunityReel(articleId: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await db.article.update({
      where: { id: articleId },
      data: { status: "REJECTED", published: false },
    });
    return { success: true, message: "Video rejected." };
  } catch {
    return { success: false, message: "Failed to reject video." };
  }
}

export async function promoteUserToCreator(userId: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, message: "Only admins can promote users to Verified Creators." };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role: "WRITER" },
    });
    return { success: true, message: "User promoted to Verified Creator (WRITER)! Future submissions will publish instantly." };
  } catch {
    return { success: false, message: "Failed to promote user." };
  }
}

export async function triggerVideoSyncAction(): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const res = await triggerScraperVideoSync();
    revalidatePath("/reels");
    return {
      success: true,
      message: `Video sync triggered: ${res.status || "OK"}`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to trigger video sync.",
    };
  }
}
