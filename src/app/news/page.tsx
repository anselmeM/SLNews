import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NewsFeed from "@/components/NewsFeed";
import { fetchSLNews } from "@/lib/news-service";

export const metadata: Metadata = {
  title: "National News | SLNews",
  description: "National and local news from across Sierra Leone. Filter by region, politics, economy, or education.",
};

const REGIONS = ["All Regions", "Western Area", "Southern", "Eastern", "Northern", "North-West"];
const TOPICS = ["All Topics", "Politics", "Economy", "Education"];

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
    region && region !== "All Regions" ? region : "",
    topic && topic !== "All Topics" ? topic : "",
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
              ...(region && region !== "All Regions" ? { region } : {}),
              ...(topic && topic !== "All Topics" ? { topic } : {}),
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
  const currentRegion = params.region || "All Regions";
  const currentTopic = params.topic || "All Topics";
  const currentPage = parseInt(params.page || "1", 10);

  const regionArg = currentRegion !== "All Regions" ? currentRegion : undefined;
  const topicArg = currentTopic !== "All Topics" ? currentTopic : undefined;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">National News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">
          Local and national news from across Sierra Leone
        </p>
      </div>

      {/* Region tabs */}
      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-3 pb-1">
        {REGIONS.map((r) => {
          const isActive = currentRegion === r;
          const params = new URLSearchParams();
          if (r !== "All Regions") params.set("region", r);
          if (currentTopic !== "All Topics") params.set("topic", currentTopic);
          const href = `/news${params.toString() ? `?${params.toString()}` : ""}`;
          return (
            <Link
              key={r}
              href={href}
              className={`px-4 py-2 rounded-full font-label-md text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-variant text-on-surface-variant hover:bg-gray-200"
              }`}
            >
              {r}
            </Link>
          );
        })}
      </nav>

      {/* Topic chips */}
      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-6 pb-1">
        {TOPICS.map((t) => {
          const isActive = currentTopic === t;
          const params = new URLSearchParams();
          if (currentRegion !== "All Regions") params.set("region", currentRegion);
          if (t !== "All Topics") params.set("topic", t);
          const href = `/news${params.toString() ? `?${params.toString()}` : ""}`;
          return (
            <Link
              key={t}
              href={href}
              className={`px-3 py-1.5 rounded-full font-label-md text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? "bg-secondary text-white shadow-sm"
                  : "bg-surface-container-lowest border border-outline/20 text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {t}
            </Link>
          );
        })}
      </nav>

      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      }>
        <SLNewsContent region={regionArg} topic={topicArg} page={currentPage} />
      </Suspense>
    </div>
  );
}