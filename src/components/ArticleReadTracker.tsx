"use client";

import { useEffect } from "react";
import { trackCustomMetaEvent } from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";

// A "read" is counted once either when the reader scrolls past 60% of the
// article or stays on the page for at least 30 seconds — whichever comes first.
const SCROLL_THRESHOLD = 0.6;
const READ_DELAY_MS = 30_000;

/**
 * Fires the custom `ArticleRead` Meta event exactly once per article view.
 * Mounted on the article page alongside the `ViewContent` tracker.
 */
export default function ArticleReadTracker({ article }: { article: NewsArticle }) {
  useEffect(() => {
    let fired = false;

    function handleScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = (window.scrollY || doc.scrollTop || 0) / scrollable;
      if (depth >= SCROLL_THRESHOLD) fire();
    }

    function fire() {
      if (fired) return;
      fired = true;
      trackCustomMetaEvent("ArticleRead", {
        content_name: article.title,
        content_category: article.category,
        content_ids: [article.id],
        content_type: "article",
      });
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    }

    const timer = setTimeout(fire, READ_DELAY_MS);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [article.id, article.title, article.category]);

  return null;
}
