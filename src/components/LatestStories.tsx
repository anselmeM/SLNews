import Link from "next/link";
import { fetchTrendingNews } from "@/lib/news-service";
import { LatestItem } from "@/components/LatestStoriesItem";

export default async function LatestStories() {
  let articles = [];
  try {
    articles = await fetchTrendingNews(0, 8);
  } catch {
    return null;
  }

  if (articles.length < 3) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-on-surface">Latest</h2>
        <Link href="/home" className="text-xs font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {articles.map((a) => (
          <LatestItem key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
