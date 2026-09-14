"use client";

import { useToast } from "@/components/Toast";
import { useBookmark } from "@/hooks/useBookmark";
import { vibrateLight } from "@/lib/haptics";
import { trackMetaEvent } from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";
import {
  formatArticleWhatsAppDigest,
  getWhatsAppShareUrl,
} from "@/lib/whatsapp-formatter";

export default function ArticleActions({ article }: { article: NewsArticle }) {
  const { isSaved, handleBookmark } = useBookmark(article);
  const { toast } = useToast();

  const handleShare = async () => {
    trackMetaEvent("Share", {
      content_type: "article",
      method: "system",
      content_name: article.title,
      content_ids: [article.id],
    });

    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/article/${article.id}`
        : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: shareUrl });
      } catch {
        // User cancelled share dialog
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast("Link copied to clipboard!", "success");
    }
  };

  const handleWhatsAppShare = () => {
    vibrateLight();
    trackMetaEvent("Share", {
      content_type: "article",
      method: "whatsapp",
      content_name: article.title,
      content_ids: [article.id],
    });

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://slnews.sl";
    const digestText = formatArticleWhatsAppDigest(
      {
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        location: article.location,
        category: article.category,
      },
      siteUrl
    );
    const waUrl = getWhatsAppShareUrl(digestText);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleBookmark}
        className="p-2.5 min-h-[44px] min-w-[44px] hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer"
        aria-label={isSaved ? "Remove bookmark" : "Bookmark article"}
        title={isSaved ? "Remove bookmark" : "Bookmark article"}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {isSaved ? "bookmark" : "bookmark_border"}
        </span>
      </button>

      <button
        onClick={handleWhatsAppShare}
        className="p-2.5 min-h-[44px] min-w-[44px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition-colors cursor-pointer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <span className="material-symbols-outlined text-[20px]">chat</span>
      </button>

      <button
        onClick={handleShare}
        className="p-2.5 min-h-[44px] min-w-[44px] hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer"
        aria-label="Share article"
        title="Share"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>
      </button>
    </div>
  );
}