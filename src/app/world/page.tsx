import type { Metadata } from "next";
import { Suspense } from "react";
import NewsFeed from "@/components/NewsFeed";
import { ShimmerFeed } from "@/components/Shimmer";
import { fetchWorldNews, type NewsArticle } from "@/lib/news-service";
import WorldTabFilters from "./_components/WorldTabFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "International News | SLNews",
  description: "International news curated for Sierra Leone readers.",
};

export default async function WorldNewsPage(props: { searchParams: Promise<{ topic?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTopic = searchParams?.topic || "World";
  let articles: NewsArticle[] = [];

  try {
    articles = await fetchWorldNews(currentTopic);
  } catch {
    articles = [];
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">International News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">Explore topics and stories from around the world</p>
      </div>

      <Suspense fallback={null}>
        <WorldTabFilters />
      </Suspense>

      <Suspense fallback={<ShimmerFeed count={4} />}>
        <NewsFeed
          articles={articles}
          emptyMessage={`No articles found for ${currentTopic}.`}
        />
      </Suspense>
    </div>
  );
}
