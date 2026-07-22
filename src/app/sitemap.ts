import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const articles = await db.article.findMany({
    where: { published: true, status: "PUBLISHED" },
    select: { id: true, updatedAt: true },
    take: 1000,
  });

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/article/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/home`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/local-news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/world`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/market`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/announcements`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    ...articleUrls,
  ];
}
