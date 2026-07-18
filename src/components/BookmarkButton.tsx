"use client";

import { useBookmark } from "@/hooks/useBookmark";
import type { NewsArticle } from "@/lib/news-service";

export default function BookmarkButton({
  article,
  variant = "card",
}: {
  article: NewsArticle;
  variant?: "card" | "featured";
}) {
  const { isSaved, handleBookmark } = useBookmark(article);

  const base = "absolute z-10 rounded-full transition-colors cursor-pointer";
  const iconSize = variant === "featured" ? "text-[20px]" : "text-[18px]";

  const classes = variant === "featured"
    ? `${base} top-4 right-4 p-2.5 backdrop-blur-md ${isSaved ? "text-primary bg-white shadow-sm" : "text-white bg-black/20 hover:bg-black/40"}`
    : `${base} bottom-3 right-3 p-2.5 ${isSaved ? "text-primary bg-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`;

  return (
    <button
      onClick={handleBookmark}
      aria-label={isSaved ? "Remove bookmark" : "Bookmark article"}
      className={classes}
      title={isSaved ? "Remove bookmark" : "Bookmark article"}
    >
      <span
        className={`material-symbols-outlined ${iconSize}`}
        style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {isSaved ? "bookmark" : "bookmark_border"}
      </span>
    </button>
  );
}
