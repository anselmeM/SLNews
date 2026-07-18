import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NewsFeed from "@/components/NewsFeed";
import { fetchNationalNews } from "@/lib/news-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "National News | SLNews",
  description: "Latest national news and updates from across Sierra Leone.",
};

const PAGE_SIZE = 10;
const TOPICS = ["National", "Politics", "Economy", "Education"];

async function NationalContent({ category, page }: { category: string; page: number }) {
  const skip = (page - 1) * PAGE_SIZE;
  const articles = await fetchNationalNews(category, skip, PAGE_SIZE + 1);
  const hasMore = articles.length > PAGE_SIZE;
  if (hasMore) articles.pop();

  return (
    <>
      <NewsFeed articles={articles} emptyMessage={`No articles found in ${category}.`} />
      {hasMore && (
        <div className="flex justify-center mt-8 mb-12">
          <Link
            href={`/national?category=${encodeURIComponent(category)}&page=${page + 1}`}
            className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:bg-on-primary-fixed-variant shadow-[0px_8px_16px_rgba(22,23,61,0.12)] transition-all duration-200"
          >
            Load More Stories
          </Link>
        </div>
      )}
    </>
  );
}

export default async function NationalNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentCategory = params.category || "National";
  const currentPage = parseInt(params.page || "1", 10);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">National News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">Stay updated with country-wide announcements</p>
      </div>

      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-6 pb-1">
        {TOPICS.map((topic) => {
          const isActive = currentCategory === topic;
          const href = topic === "National" ? "/national" : `/national?category=${encodeURIComponent(topic)}`;
          return (
            <Link
              key={topic}
              href={href}
              className={`px-4 py-2 rounded-full font-label-md text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-variant text-on-surface-variant hover:bg-gray-200"
              }`}
            >
              {topic}
            </Link>
          );
        })}
      </nav>

      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      }>
        <NationalContent category={currentCategory} page={currentPage} />
      </Suspense>
    </div>
  );
}