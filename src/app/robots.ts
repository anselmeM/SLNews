import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://slnews.sl";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/home",
          "/local-news",
          "/world",
          "/article/",
          "/market",
          "/announcements",
          "/about",
          "/search",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/profile/",
          "/forgot-password",
          "/reset-password",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
