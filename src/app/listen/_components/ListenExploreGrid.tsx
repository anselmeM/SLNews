"use client";

import { useState } from "react";
import type { NewsArticle } from "@/lib/news-service";
import { calculateReadingTime } from "@/lib/reading-time";

const TOPICS = ["All", "National", "Politics", "Economy", "Tech", "Sports"];

interface ListenExploreGridProps {
  articles: NewsArticle[];
  onPlayArticle: (article: NewsArticle) => void;
  onAddToQueue: (article: NewsArticle) => void;
}

export function ListenExploreGrid({
  articles,
  onPlayArticle,
  onAddToQueue,
}: ListenExploreGridProps) {
  const [filterTopic, setFilterTopic] = useState<string>("All");

  const filteredArticles =
    filterTopic === "All"
      ? articles
      : articles.filter((a) => a.category.toLowerCase() === filterTopic.toLowerCase());

  return (
    <section className="space-y-4 pt-4 border-t border-outline-variant/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">library_music</span>
          <h2 className="font-bold text-base sm:text-lg text-on-surface">
            Explore &amp; Queue Stories
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterTopic(t)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterTopic === t
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="group flex flex-col justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                <span className="font-bold text-primary">{art.category}</span>
                <span>{calculateReadingTime(art.content || art.summary).text}</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h3>
            </div>

            <div className="flex gap-2 pt-3 mt-3 border-t border-outline-variant/40">
              <button
                type="button"
                onClick={() => onPlayArticle(art)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors cursor-pointer min-h-[36px]"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                Play
              </button>
              <button
                type="button"
                onClick={() => onAddToQueue(art)}
                className="py-1.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-1 border border-outline-variant/30 transition-colors cursor-pointer min-h-[36px]"
                title="Add to queue"
              >
                <span className="material-symbols-outlined text-base">playlist_add</span>
                + Queue
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
