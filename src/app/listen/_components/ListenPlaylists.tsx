"use client";

import type { NewsArticle } from "@/lib/news-service";

interface ListenPlaylistsProps {
  articles: NewsArticle[];
  onPlayCurated: (articles: NewsArticle[], name: string) => void;
}

export function ListenPlaylists({ articles, onPlayCurated }: ListenPlaylistsProps) {
  const topFive = articles.slice(0, 5);
  const nationalStories = articles
    .filter((a) => a.category === "National" || a.category === "Politics")
    .slice(0, 5);
  const businessTechStories = articles
    .filter(
      (a) => a.category === "Economy" || a.category === "Tech" || a.category === "Sports"
    )
    .slice(0, 5);

  return (
    <section className="space-y-4 pt-4 border-t border-outline-variant/60">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">podcasts</span>
        <h2 className="font-bold text-base sm:text-lg text-on-surface">
          Curated Audio Channels
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top 5 Headlines */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              Daily Flash
            </span>
            <h3 className="font-black text-lg text-on-surface mt-2">Today&apos;s Top 5 Headlines</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              The most important news stories of the day in a 5-minute continuous briefing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onPlayCurated(topFive, "Top 5 Headlines")}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-base">play_circle</span>
            Play All ({topFive.length})
          </button>
        </div>

        {/* National & Politics */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              Governance
            </span>
            <h3 className="font-black text-lg text-on-surface mt-2">National &amp; Politics</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Policy updates, civic affairs, and parliament proceedings across Sierra Leone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onPlayCurated(nationalStories, "National & Politics")}
            className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-secondary/90 transition-colors shadow-sm cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-base">play_circle</span>
            Play All ({nationalStories.length})
          </button>
        </div>

        {/* Business & Tech */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="bg-tertiary-container text-on-tertiary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              Economy &amp; Innovation
            </span>
            <h3 className="font-black text-lg text-on-surface mt-2">Business, Tech &amp; Sports</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Market shifts, Leone exchange updates, technology trends, and football results.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onPlayCurated(businessTechStories, "Business, Tech & Sports")}
            className="w-full py-2.5 rounded-xl bg-tertiary text-on-tertiary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-tertiary/90 transition-colors shadow-sm cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-base">play_circle</span>
            Play All ({businessTechStories.length})
          </button>
        </div>
      </div>
    </section>
  );
}
