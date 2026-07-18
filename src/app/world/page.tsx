import type { Metadata } from "next";
import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { fetchWorldNews } from "@/lib/news-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World News | SLNews",
  description: "International news curated for Sierra Leone readers.",
};

export default async function WorldNewsPage(props: { searchParams: Promise<{ topic?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTopic = searchParams?.topic || "World";
  const articles = await fetchWorldNews(currentTopic);

  const topics = ["World", "Africa", "Business", "Tech", "Health"];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">International News</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">Explore topics and stories from around the world</p>
      </div>

      {/* Categories Scroll */}
      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-6 pb-1">
        {topics.map((topic) => {
          const isActive = currentTopic === topic;
          
          return (
            <Link
              key={topic}
              href={`/world?topic=${topic}`}
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

      <NewsFeed
        articles={articles}
        emptyMessage={`No articles found for ${currentTopic}.`}
      />
    </div>
  );
}
