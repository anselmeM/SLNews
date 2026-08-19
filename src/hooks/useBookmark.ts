import { useCallback } from "react";
import { toggleSavedArticle } from "@/app/actions/user-actions";
import { vibrateLight } from "@/lib/haptics";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

async function cacheArticleImage(imageUrl: string | null | undefined) {
  if (!imageUrl || typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cache = await caches.open("slnews-offline-images-v1");
    const existing = await cache.match(imageUrl);
    if (!existing) {
      const res = await fetch(imageUrl, { mode: "cors" });
      if (res.ok) {
        await cache.put(imageUrl, res);
      }
    }
  } catch {
    // Ignore offline cache errors
  }
}

export function useBookmark(article: NewsArticle) {
  const isSaved = useAppStore((s) => s.isSaved(article.id));
  const toggleSave = useAppStore((s) => s.toggleSave);

  const handleBookmark = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      vibrateLight();
      const willSave = !isSaved;
      toggleSave(article);
      toggleSavedArticle(article.id);

      if (willSave && article.imageUrl) {
        cacheArticleImage(article.imageUrl);
      }
    },
    [article, isSaved, toggleSave]
  );

  return { isSaved, handleBookmark };
}