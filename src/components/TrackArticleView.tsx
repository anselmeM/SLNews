"use client";

import { useEffect } from "react";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

export default function TrackArticleView({ article }: { article: NewsArticle }) {
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);

  useEffect(() => {
    addRecentlyViewed(article);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id, article.title, addRecentlyViewed]);

  return null;
}
