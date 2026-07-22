import type { Metadata } from "next";
import NewsFeed from "@/components/NewsFeed";
import { fetchLocalNews, fetchNationalNews, type NewsArticle } from "@/lib/news-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local News | SLNews",
  description: "Local and national news from across Sierra Leone.",
};

export default async function LocalNewsPage() {
  let localArticles: NewsArticle[] = [];
  let nationalArticles: NewsArticle[] = [];

  try {
    [localArticles, nationalArticles] = await Promise.all([
      fetchLocalNews(undefined, undefined, 0, 5),
      fetchNationalNews(undefined, 0, 5),
    ]);
  } catch {
    localArticles = [];
    nationalArticles = [];
  }

  const allArticles = [...localArticles, ...nationalArticles];
  allArticles.sort((a, b) => new Date(b.publishedAt || "").getTime() - new Date(a.publishedAt || "").getTime());

  return (
    <div className="w-full pt-4 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">Local News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">
          Local and national stories from across Sierra Leone
        </p>
      </div>

      <NewsFeed articles={allArticles} emptyMessage="No local or national articles found." />
    </div>
  );
}
