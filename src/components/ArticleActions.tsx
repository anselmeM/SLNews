"use client";

import { useBookmark } from "@/hooks/useBookmark";
import type { NewsArticle } from "@/lib/news-service";

export default function ArticleActions({ article }: { article: NewsArticle }) {
  const { isSaved, handleBookmark } = useBookmark(article);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: article.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleBookmark}
        className="p-3 hover:bg-gray-100 rounded-full transition-colors text-on-surface-variant cursor-pointer"
        aria-label={isSaved ? "Remove bookmark" : "Bookmark article"}
        title={isSaved ? "Remove bookmark" : "Bookmark article"}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {isSaved ? "bookmark" : "bookmark_border"}
        </span>
      </button>
      <button
        onClick={handleShare}
        className="p-3 hover:bg-gray-100 rounded-full transition-colors text-on-surface-variant cursor-pointer"
        aria-label="Share article"
        title="Share"
      >
        <span className="material-symbols-outlined text-[22px]">share</span>
      </button>
    </div>
  );
}