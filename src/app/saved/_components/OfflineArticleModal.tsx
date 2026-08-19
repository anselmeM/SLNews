"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import ArticleImage from "@/components/ArticleImage";
import ListenButton from "@/components/ListenButton";
import { useToast } from "@/components/Toast";
import { vibrateLight } from "@/lib/haptics";
import type { NewsArticle } from "@/lib/news-service";
import { calculateReadingTime } from "@/lib/reading-time";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  article: NewsArticle | null;
  onClose: () => void;
}

export default function OfflineArticleModal({ article, onClose }: Props) {
  const { toast } = useToast();
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);

  useEffect(() => {
    if (!article) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [article, onClose]);

  if (!article) return null;

  const readTime = calculateReadingTime(article.content);
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fontClass =
    fontSize === "large"
      ? "text-lg leading-relaxed"
      : fontSize === "xlarge"
      ? "text-xl leading-loose"
      : "text-base leading-relaxed";

  const handleShareWhatsApp = () => {
    vibrateLight();
    const text = `📰 *${article.title}*\n\n${article.summary || article.content.slice(0, 160)}...\n\nRead on SLNews: https://slnews.org/article/${article.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = async () => {
    vibrateLight();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Could not copy link", "error");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/40 bg-surface-container-low shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                Offline Story
              </span>
              <span className="text-xs font-semibold text-on-surface-variant">
                {article.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Font Size Toggle */}
              <div className="flex items-center bg-surface-container rounded-lg p-0.5 mr-1">
                <button
                  type="button"
                  onClick={() => setFontSize("normal")}
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    fontSize === "normal" ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                  title="Normal font size"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("large")}
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    fontSize === "large" ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                  title="Large font size"
                >
                  A+
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                aria-label="Close offline reader"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-7 space-y-5">
            {article.imageUrl && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-surface-container">
                <ArticleImage
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 650px"
                  className="object-cover"
                />
              </div>
            )}

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight leading-tight mb-2">
                {article.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                <span>{article.source}</span>
                <span>·</span>
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{readTime.text}</span>
              </div>
            </div>

            {article.summary && (
              <p className="text-base font-medium text-on-surface-variant pl-4 border-l-4 border-primary/40 leading-relaxed italic bg-surface-container-low/50 py-2 rounded-r-xl">
                {article.summary}
              </p>
            )}

            {/* Formatted Paragraphs */}
            <div className={`space-y-4 text-on-surface font-normal ${fontClass}`}>
              {article.content
                .split("\n\n")
                .filter((p) => p.trim())
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="px-5 py-3.5 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ListenButton title={article.title} content={article.content} />
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors"
                title="Share via WhatsApp"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                title="Copy Link"
              >
                <span className="material-symbols-outlined text-base">link</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs cursor-pointer transition-colors"
            >
              Done Reading
            </button>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
