"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { useToast } from "@/components/Toast";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrate, vibrateLight, vibrateSuccess } from "@/lib/haptics";
import type { NewsArticle } from "@/lib/news-service";
import {
  formatArticleWhatsAppDigest,
  getWhatsAppShareUrl,
} from "@/lib/whatsapp-formatter";

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

  const handleWhatsApp = () => {
    vibrateLight();
    const digestText = formatArticleWhatsAppDigest(
      {
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        location: article.location,
        category: article.category,
      },
      window.location.origin
    );
    const waUrl = getWhatsAppShareUrl(digestText);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleCopyWhatsAppDigest = async () => {
    vibrateSuccess();
    const digestText = formatArticleWhatsAppDigest(
      {
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        location: article.location,
        category: article.category,
      },
      window.location.origin
    );
    try {
      await navigator.clipboard.writeText(digestText);
      toast("WhatsApp formatted digest copied!", "success");
    } catch {
      toast("Could not copy digest", "error");
    }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          vibrate();
        }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl">share</span>
        <span className="hidden sm:inline">Share</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="space-y-1">
          <button
            onClick={() => {
              handleBookmark();
              vibrate(15);
              setOpen(false);
            }}
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
            onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl text-emerald-600 dark:text-emerald-400">
              chat
            </span>
            <div className="text-left">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                Share to WhatsApp
              </div>
              <div className="text-[11px] text-on-surface-variant">
                Rich summary with key takeaways & Sierra Leone coverage
              </div>
            </div>
          </button>

          <button
            onClick={handleCopyWhatsAppDigest}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl text-primary">
              content_copy
            </span>
            Copy WhatsApp Summary
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl text-primary">share</span>
            Share via System
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
            <span className="material-symbols-outlined text-xl text-primary">
              open_in_browser
            </span>
            Open in browser
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
