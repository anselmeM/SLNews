"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { NewsArticle } from "@/lib/news-service";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrate } from "@/lib/haptics";
import { useLongPress } from "@/hooks/useLongPress";
import ArticleImage from "./ArticleImage";
import { useAppStore } from "@/store/useAppStore";

const THRESHOLD = 80;

export default function SwipeableCard({ article }: { article: NewsArticle }) {
  const dataSaver = useAppStore((s) => s.dataSaver);
  const { isSaved, handleBookmark } = useBookmark(article);
  const x = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const longPress = useLongPress(() => { setContextMenu(true); vibrate(30); });

  const saveOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
  const shareOpacity = useTransform(x, [-THRESHOLD, 0], [0, 1]);
  const saveScale = useTransform(x, [0, THRESHOLD], [0.6, 1]);
  const shareScale = useTransform(x, [-THRESHOLD, 0], [0.6, 1]);

  const handleDragEnd = () => {
    const offset = x.get();
    if (offset > THRESHOLD) {
      handleBookmark();
      vibrate();
    } else if (offset < -THRESHOLD) {
      if (navigator.share) {
        navigator.share({ title: article.title, url: `${window.location.origin}/article/${article.id}` });
      } else {
        navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
      }
      vibrate();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl" ref={ref}>
      {/* Swipe action backgrounds */}
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center pl-6 z-0"
        style={{ opacity: saveOpacity }}
      >
        <motion.div style={{ scale: saveScale }} className="flex items-center gap-2 text-green-600">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            bookmark
          </span>
          <span className="text-sm font-bold">Save</span>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center pr-6 z-0"
        style={{ opacity: shareOpacity }}
      >
        <motion.div style={{ scale: shareScale }} className="flex items-center gap-2 text-blue-600">
          <span className="text-sm font-bold">Share</span>
          <span className="material-symbols-outlined text-2xl">share</span>
        </motion.div>
      </motion.div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={ref}
        dragElastic={0.2}
        style={{ x }}
        onDragStart={() => { setDragging(true); vibrate(); }}
        onDragEnd={() => { handleDragEnd(); setDragging(false); }}
        {...longPress}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.04)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface-container-lowest rounded-3xl p-3 flex gap-4 relative z-10 cursor-grab active:cursor-grabbing select-none"
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
      >
        {!dragging && (
          <Link href={`/article/${article.id}`} className="flex-1 flex gap-4 w-full items-center select-none" aria-label={article.title} onContextMenu={(e) => e.preventDefault()} style={{ WebkitTouchCallout: "none" } as React.CSSProperties}>
            {!dataSaver && (
              <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 relative bg-surface-container">
                <ArticleImage
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 112px, 112px"
                  className="object-cover"
                />
              </div>
            )}
            {dataSaver && (
              <div className="w-28 h-28 rounded-2xl shrink-0 bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-outline">data_saver_on</span>
              </div>
            )}
            <div className="flex-1 py-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-label-sm text-[11px] font-semibold text-primary uppercase tracking-wide">
                  {article.location || article.category}
                </span>
              </div>
              <h3 className="font-headline-sm text-base sm:text-lg leading-snug font-bold mb-1.5 text-on-surface pr-8 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-xs">
                <span className="truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px] font-medium">
                  {article.source || "News"}
                </span>
                <span>•</span>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </Link>
        )}
        {dragging && (
          <div className="flex-1 flex gap-4 w-full items-center py-1">
            <div className="flex-1 text-center text-sm text-on-surface-variant font-medium">
              {"< Swipe right to save • Swipe left to share >"}
            </div>
          </div>
        )}
        {contextMenu && (
          <div className="absolute inset-0 z-30 bg-surface/95 backdrop-blur-sm rounded-3xl flex items-center justify-center gap-4" onClick={() => setContextMenu(false)}>
            <button
              onClick={(e) => { e.stopPropagation(); handleBookmark(); vibrate(); setContextMenu(false); }}
              className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl text-green-600" style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {isSaved ? "bookmark" : "bookmark_border"}
              </span>
              <span className="text-xs font-semibold">{isSaved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) navigator.share({ title: article.title, url: `${window.location.origin}/article/${article.id}` });
                else navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
                vibrate(); setContextMenu(false);
              }}
              className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl text-blue-600">share</span>
              <span className="text-xs font-semibold">Share</span>
            </button>
          </div>
        )}
        {isSaved && (
          <div className="absolute top-3 right-3 z-20 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
