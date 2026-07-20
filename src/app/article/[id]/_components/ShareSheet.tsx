"use client";

import { useState } from "react";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrate } from "@/lib/haptics";
import { useToast } from "@/components/Toast";
import BottomSheet from "@/components/BottomSheet";
import type { NewsArticle } from "@/lib/news-service";

export default function ShareSheet({ article }: { article: NewsArticle }) {
  const [open, setOpen] = useState(false);
  const { isSaved, handleBookmark } = useBookmark(article);
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/article/${article.id}`;
    if (navigator.share) {
      await navigator.share({ title: article.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard!", "success");
    }
    setOpen(false);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
    toast("Link copied!", "success");
    setOpen(false);
  };

  const handleOpenBrowser = () => {
    window.open(`${window.location.origin}/article/${article.id}`, "_blank");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); vibrate(); }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl">share</span>
        <span className="hidden sm:inline">Share</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="space-y-1">
          <button
            onClick={() => { handleBookmark(); vibrate(15); setOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span
              className="material-symbols-outlined text-xl text-primary"
              style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {isSaved ? "bookmark" : "bookmark_border"}
            </span>
            {isSaved ? "Remove from saved" : "Save article"}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl text-primary">share</span>
            Share
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl text-primary">link</span>
            Copy link
          </button>

          <button
            onClick={handleOpenBrowser}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl text-primary">open_in_browser</span>
            Open in browser
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
