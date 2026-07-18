import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import SearchSuggestions from "./_components/SearchSuggestions";
import NewsFeed from "@/components/NewsFeed";
import { searchArticles } from "@/lib/news-service";
import { checkRateLimit } from "@/lib/rate-limiter";

export const metadata: Metadata = {
  title: "Search | SLNews",
  description: "Search news articles on SLNews.",
};

const POPULAR_TOPICS = ["Politics", "Sports", "Freetown", "Economy", "Health"];
const CATEGORY_FILTERS = ["All", "National", "Politics", "Sports", "Business", "Technology", "Health", "Entertainment"];

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const category = searchParams.category || "";

  if (query) {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || headersList.get("x-real-ip") || "127.0.0.1";
    const rateLimit = checkRateLimit(`search:${ip}`, { maxRequests: 30, windowMs: 60_000 });
    if (!rateLimit.allowed) {
      return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none mt-4">Search Results</h1>
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant text-center min-h-[40vh]">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant select-none">hourglass</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Too many requests</h2>
            <p className="text-sm text-gray-500 font-medium">Try again in {rateLimit.retryAfter}s.</p>
          </div>
        </div>
      );
    }
  }

  const results = query ? await searchArticles(query) : [];

  const filteredResults = category
    ? results.filter((r) => r.category.toLowerCase() === category.toLowerCase())
    : results;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <section className="mt-4 mb-2 flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none">
          {query ? "Search Results" : "Search"}
        </h1>
        {query ? (
          <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">
            Found {filteredResults.length} {filteredResults.length === 1 ? "article" : "articles"} matching{" "}
            <span className="font-bold text-primary">&ldquo;{query}&rdquo;</span>
          </p>
        ) : (
          <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">
            Use the search bar above to find news articles.
          </p>
        )}
      </section>

      <SearchSuggestions currentQuery={query} />

      {!query && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((topic) => (
              <Link
                key={topic}
                href={`/search?q=${encodeURIComponent(topic)}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </section>
      )}

      {query && (
        <div className="flex flex-wrap gap-2 pb-2">
          {CATEGORY_FILTERS.map((f) => {
            const isActive = f === "All" ? !category : category.toLowerCase() === f.toLowerCase();
            const href =
              f === "All"
                ? `/search?q=${encodeURIComponent(query)}`
                : `/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(f)}`;
            return (
              <Link
                key={f}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-gray-200 text-on-surface hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </Link>
            );
          })}
        </div>
      )}

      {query && filteredResults.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant text-center gap-4 shadow-sm min-h-[40vh]">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant select-none">search_off</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface">No results found</h2>
          <p className="text-sm text-gray-500 font-medium max-w-xs leading-relaxed">
            We couldn&rsquo;t find any articles matching your search. Try using different keywords or checking your spelling.
          </p>
          <Link href="/home" className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/95 transition-colors shadow-sm">
            Return Home
          </Link>
        </div>
      )}

      {filteredResults.length > 0 && <NewsFeed articles={filteredResults} featured={false} />}
    </div>
  );
}
