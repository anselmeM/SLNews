"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrate } from "@/lib/haptics";
import { useToast } from "@/components/Toast";
import type { NewsArticle } from "@/lib/news-service";

export function StickyActions({ article }: { article: NewsArticle }) {
  const [visible, setVisible] = useState(false);
  const { isSaved, handleBookmark } = useBookmark(article);
  const { toast } = useToast();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/article/${article.id}`;
    if (navigator.share) {
      await navigator.share({ title: article.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied!", "success");
    }
  }, [article, toast]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-primary uppercase tracking-wide truncate">
              {article.category}
            </span>
            <span className="text-sm font-medium text-on-surface truncate hidden sm:inline">
              {article.title}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { handleBookmark(e); vibrate(15); }}
              className="p-3 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
              aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={isSaved ? { fontVariationSettings: "'FILL' 1", color: "var(--color-primary)" } : { color: "var(--color-on-surface-variant)" }}
              >
                {isSaved ? "bookmark" : "bookmark_border"}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
              aria-label="Share"
            >
              <span className="material-symbols-outlined text-xl text-on-surface-variant">share</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: `${window.location.origin}/article/${article.id}` });
                }
              }}
              className="sm:hidden p-3 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              aria-label="More"
            >
              <span className="material-symbols-outlined text-xl text-on-surface-variant">more_horiz</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
