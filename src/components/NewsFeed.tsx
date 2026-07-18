"use client";

import ArticleCard from "@/components/ArticleCard";
import FeaturedArticleCard from "@/components/FeaturedArticleCard";
import type { NewsArticle } from "@/lib/news-service";

export default function NewsFeed({
  articles,
  emptyMessage = "No articles found.",
  emptyIcon = "article",
  featured = true,
  showDividers = true,
  loadMoreLabel,
  onLoadMore,
  loadingMore = false,
}: {
  articles: NewsArticle[];
  emptyMessage?: string;
  emptyIcon?: string;
  featured?: boolean;
  showDividers?: boolean;
  loadMoreLabel?: string;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
          {emptyIcon}
        </span>
        <p className="font-body-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {featured && articles[0] && <FeaturedArticleCard article={articles[0]} />}

      <div className="flex flex-col gap-4 mb-8 mt-6">
        {articles.slice(featured ? 1 : 0).map((article) => (
          <div key={article.id}>
            <ArticleCard article={article} />
            {showDividers && (
              <div className="w-full h-px bg-surface-variant my-2"></div>
            )}
          </div>
        ))}
      </div>

      {loadMoreLabel && onLoadMore && (
        <div className="flex justify-center mb-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:bg-on-primary-fixed-variant shadow-[0px_8px_16px_rgba(22,23,61,0.12)] transition-all duration-200 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : loadMoreLabel}
          </button>
        </div>
      )}
    </>
  );
}
