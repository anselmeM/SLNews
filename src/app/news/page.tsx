import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NewsFeed from "@/components/NewsFeed";
import { ShimmerFeed } from "@/components/Shimmer";
import { fetchSLNews } from "@/lib/news-service";
import TabFilters from "./_components/TabFilters";

export const metadata: Metadata = {
  title: "Local News | SLNews",
  description: "Local news from across Sierra Leone. Filter by region, politics, economy, or education.",
};

const PAGE_SIZE = 10;

type PageParams = {
  region?: string;
  topic?: string;
  page?: string;
};

async function SLNewsContent({ region, topic, page }: { region?: string; topic?: string; page: number }) {
  const skip = (page - 1) * PAGE_SIZE;
  const articles = await fetchSLNews(region, topic, skip, PAGE_SIZE + 1);
  const hasMore = articles.length > PAGE_SIZE;
  if (hasMore) articles.pop();

  const label = [
    region || "",
    topic || "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <NewsFeed
        articles={articles}
        emptyMessage={`No articles found${label ? ` for ${label}` : ""}.`}
      />
      {hasMore && (
        <div className="flex justify-center mt-8 mb-12">
          <Link
            href={`/news?${new URLSearchParams({
              ...(region ? { region } : {}),
              ...(topic ? { topic } : {}),
              page: String(page + 1),
            }).toString()}`}
            className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:bg-on-primary-fixed-variant shadow-[0px_8px_16px_rgba(22,23,61,0.12)] transition-all duration-200"
          >
            Load More Stories
          </Link>
        </div>
      )}
    </>
  );
}

export default async function SLNewsPage({
  searchParams,
}: {
  searchParams: Promise<PageParams>;
}) {
  const params = await searchParams;
  const currentRegion = params.region;
  const currentTopic = params.topic;
  const currentPage = parseInt(params.page || "1", 10);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">Local News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">
          Local and national news from across Sierra Leone
        </p>
      </div>

      <Suspense fallback={null}>
        <TabFilters />
      </Suspense>

      <Suspense fallback={<ShimmerFeed count={3} />}>
        <SLNewsContent region={currentRegion} topic={currentTopic} page={currentPage} />
      </Suspense>
    </div>
  );
}