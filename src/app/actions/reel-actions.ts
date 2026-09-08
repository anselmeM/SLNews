"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CURATED_SL_REELS, type ReelVideo } from "@/lib/fixtures/curated-reels";
import { fetchScraperVideos, triggerScraperVideoSync, type ScraperVideo } from "@/lib/scraper-client";

export type { ReelVideo };

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

  // Deduplicate and combine scraped videos, community reels, and curated broadcaster reels
  const seenUrls = new Set<string>();
  const combined: ReelVideo[] = [];

  for (const r of [...scraperReels, ...dbReels, ...CURATED_SL_REELS]) {
    const key = r.videoUrl.trim();
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      combined.push(r);
    }
  }

  return combined.slice(skip, skip + take);
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
