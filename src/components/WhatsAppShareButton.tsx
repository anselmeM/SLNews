"use client";

import type { MouseEvent } from "react";
import { vibrateLight } from "@/lib/haptics";
import { trackMetaEvent } from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";
import { formatArticleWhatsAppDigest, getWhatsAppShareUrl } from "@/lib/whatsapp-formatter";

/**
 * One-tap WhatsApp share button for feed/list cards. Renders an explicit green
 * action that opens a pre-formatted digest in WhatsApp and fires the `Share`
 * Meta event with `method: "whatsapp"`.
 */
export default function WhatsAppShareButton({
  article,
  className,
  iconSize = "text-[18px]",
}: {
  article: NewsArticle;
  className?: string;
  iconSize?: string;
}) {
  const handleShare = (e: MouseEvent<HTMLButtonElement>) => {
    // The card content is wrapped in a <Link>; keep the tap from navigating.
    e.preventDefault();
    e.stopPropagation();

    vibrateLight();
    trackMetaEvent("Share", {
      content_type: "article",
      method: "whatsapp",
      content_name: article.title,
      content_ids: [article.id],
    });

    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : "https://slnews.sl";
    const digest = formatArticleWhatsAppDigest(
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

    window.open(getWhatsAppShareUrl(digest), "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share on WhatsApp"
      title="Share on WhatsApp"
      className={
        className ??
        "absolute bottom-3 right-16 z-10 p-3 min-w-[44px] min-h-[44px] rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
      }
    >
      <span className={`material-symbols-outlined ${iconSize}`}>chat</span>
    </button>
  );
}
