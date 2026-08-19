"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import TextSizeSelector from "./TextSizeSelector";
import ListenButton from "@/components/ListenButton";
import { useToast } from "@/components/Toast";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrateLight } from "@/lib/haptics";
import type { NewsArticle } from "@/lib/news-service";

export function StickyActions({ article }: { article: NewsArticle }) {
  const [visible, setVisible] = useState(false);
  const { isSaved, handleBookmark } = useBookmark(article);
  const { toast } = useToast();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
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
        <m.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-2.5 flex items-center justify-between pb-[80px] md:pb-3.5"
          style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-2 min-w-0 mr-2">
            <span className="text-[11px] font-black text-primary uppercase tracking-wide truncate bg-primary/10 px-2 py-0.5 rounded">
              {article.category}
            </span>
            <span className="text-xs sm:text-sm font-bold text-on-surface truncate hidden sm:inline">
              {article.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <TextSizeSelector />
            <ListenButton title={article.title} content={article.content} />

            <button
              type="button"
              onClick={(e) => {
                handleBookmark(e);
                vibrateLight();
              }}
              className="p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={
                  isSaved
                    ? { fontVariationSettings: "'FILL' 1", color: "var(--color-primary)" }
                    : { color: "var(--color-on-surface-variant)" }
                }
              >
                {isSaved ? "bookmark" : "bookmark_border"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              aria-label="Share article"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant">
                share
              </span>
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
