import type { Metadata } from "next";
import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { fetchLocalNews, fetchNationalNews } from "@/lib/news-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local News | SLNews",
  description: "Local and national news from across Sierra Leone.",
};

export default async function LocalNewsPage() {
  const [localArticles, nationalArticles] = await Promise.all([
    fetchLocalNews(undefined, undefined, 0, 5),
    fetchNationalNews(undefined, 0, 5),
  ]);

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

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">Provinces</h2>
          <Link href="/local" className="text-sm font-semibold text-primary hover:underline">
            Browse all provinces →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["Western Area", "Southern", "Eastern", "Northern", "North-West"].map((p) => (
            <Link
              key={p}
              href={`/local?province=${encodeURIComponent(p)}`}
              className="rounded-xl p-4 bg-white border border-gray-100 hover:shadow-sm transition-all text-center"
            >
              <span className="font-semibold text-sm text-on-surface">{p}</span>
            </Link>
          ))}
        </div>
      </section>

      <NewsFeed articles={allArticles} emptyMessage="No local or national articles found." />
    </div>
  );
}
