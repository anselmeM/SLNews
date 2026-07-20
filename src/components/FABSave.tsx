"use client";

import { motion } from "framer-motion";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrate } from "@/lib/haptics";
import { useToast } from "@/components/Toast";
import type { NewsArticle } from "@/lib/news-service";

export default function FABSave({ article }: { article: NewsArticle }) {
  const { isSaved, handleBookmark } = useBookmark(article);
  const { toast } = useToast();

  return (
    <motion.button
      onClick={(e) => {
        handleBookmark(e);
        vibrate(15);
        toast(isSaved ? "Removed from saved" : "Article saved!", "success");
      }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-40 right-4 z-30 p-4 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-colors duration-200 min-w-[56px] min-h-[56px]"
      style={{
        backgroundColor: isSaved ? "var(--color-primary)" : "var(--color-surface-container-highest)",
        color: isSaved ? "white" : "var(--color-on-surface)",
      }}
      aria-label={isSaved ? "Remove from saved" : "Save article"}
      title={isSaved ? "Remove from saved" : "Save article"}
    >
      <span
        className="material-symbols-outlined text-2xl"
        style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {isSaved ? "bookmark" : "bookmark_border"}
      </span>
    </motion.button>
  );
}
