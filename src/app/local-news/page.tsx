import type { Metadata } from "next";
import LocalNewsFeed from "./LocalNewsFeed";
import { fetchLocalNews, type NewsArticle } from "@/lib/news-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local News | SLNews",
  description: "Local and national news from across Sierra Leone.",
};

export default async function LocalNewsPage() {
  let articles: NewsArticle[] = [];

  try {
    articles = await fetchLocalNews(undefined, undefined, 0, 10);
  } catch {
    articles = [];
  }

  return (
    <div className="w-full pt-4 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">Local News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">
          Local and national stories from across Sierra Leone
        </p>
      </div>

      <LocalNewsFeed initialArticles={articles} />
    </div>
  );
}
