"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

export default function TrackArticleView({ article }: { article: NewsArticle }) {
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);

  useEffect(() => {
    addRecentlyViewed(article);
    trackMetaEvent("ViewContent", {
      content_name: article.title,
      content_category: article.category,
      content_ids: [article.id],
      content_type: "article",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id, article.title, addRecentlyViewed]);

  return null;
}
