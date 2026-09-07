"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrateLight } from "@/lib/haptics";
import type { NewsArticle } from "@/lib/news-service";

export default function ContextualArticleHeader({ article }: { article: NewsArticle }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isSaved, handleBookmark } = useBookmark(article);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show once user has scrolled past hero/title area (> 260px)
      setVisible(scrollY > 260);

      // Calculate reading progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(Math.max(scrollY / docHeight, 0), 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = () => {
    vibrateLight();
    router.back();
  };

  const handleShare = async () => {
    vibrateLight();
    const url = `${window.location.origin}/article/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
      } catch {
        // Ignored if user dismissed native share sheet
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <aside
      aria-label="Article navigation and reading progress"
      className={`fixed top-0 left-0 right-0 z-[95] bg-surface/90 dark:bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 transition-all duration-300 select-none ${
        visible
          ? "translate-y-0 opacity-100 shadow-sm"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-3">
        {/* Back button + Category + Headline */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container active:scale-90 transition-all text-on-surface-variant hover:text-on-surface shrink-0"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
          </button>

          <span className="hidden sm:inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0">
            {article.category}
          </span>

          <h2 className="text-xs sm:text-sm font-semibold text-on-surface truncate min-w-0">
            {article.title}
          </h2>
        </div>

        {/* Quick Actions (Bookmark & Share) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              vibrateLight();
              handleBookmark(e);
            }}
            className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container active:scale-90 transition-all ${
              isSaved ? "text-primary" : "text-on-surface-variant"
            }`}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark story"}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {isSaved ? "bookmark" : "bookmark_border"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container active:scale-90 transition-all text-on-surface-variant"
            aria-label="Share article"
          >
            <span className="material-symbols-outlined text-[20px]">
              share
            </span>
          </button>
        </div>
      </div>

      {/* Embedded 2px Reading Progress Line */}
      <div className="w-full h-[2px] bg-outline-variant/20 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-100 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </aside>
  );
}
