import { useCallback } from "react";
import { toggleSavedArticle } from "@/app/actions/user-actions";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

export function useBookmark(article: NewsArticle) {
  const isSaved = useAppStore((s) => s.isSaved(article.id));
  const toggleSave = useAppStore((s) => s.toggleSave);

  const handleBookmark = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      toggleSave(article);
      toggleSavedArticle(article.id);
    },
    [article, toggleSave]
  );

  return { isSaved, handleBookmark };
}