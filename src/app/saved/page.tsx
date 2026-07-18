"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import NewsFeed from "@/components/NewsFeed";
import { useAppStore } from "@/store/useAppStore";

export default function SavedStoriesPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterText, setFilterText] = useState("");
  const savedArticles = useAppStore((state) => state.savedArticles);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterText
      ? savedArticles.filter((a) => a.title.toLowerCase().includes(filterText.toLowerCase()))
      : savedArticles;

    return [...filtered].sort((a, b) => {
      const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
  }, [savedArticles, sortOrder, filterText]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500 font-semibold text-sm">
        Loading saved stories...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <section className="mt-4 mb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none">
              Saved Stories
            </h1>
            {savedArticles.length > 0 && (
              <span className="text-sm font-semibold text-on-surface-variant">
                {savedArticles.length} saved {savedArticles.length === 1 ? "story" : "stories"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full text-primary font-bold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[16px]">cloud_done</span>
            <span>Offline Ready</span>
          </div>
        </div>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight max-w-2xl">
          Access your bookmarked articles anytime, even without an internet connection.
        </p>
      </section>

      {savedArticles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant text-center gap-4 shadow-sm min-h-[40vh]"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-4xl text-gray-300 select-none">bookmark</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface">No bookmarked stories</h2>
          <p className="text-sm text-gray-500 font-medium max-w-xs leading-relaxed">
            Articles you bookmark while browsing will appear here so you can read them offline.
          </p>
          <p className="text-xs text-on-surface-variant font-medium max-w-xs leading-relaxed">
            Tap the{" "}
            <span className="material-symbols-outlined text-sm align-middle text-on-surface-variant">bookmark</span>{" "}
            icon on any article to save it for later.
          </p>
          <Link
            href="/home"
            className="mt-2 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/95 transition-colors shadow-sm"
          >
            Start Browsing
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Sort & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-gray-100/70 rounded-xl p-1">
              <button
                onClick={() => setSortOrder("newest")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortOrder === "newest"
                    ? "bg-white text-on-surface shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortOrder("oldest")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortOrder === "oldest"
                    ? "bg-white text-on-surface shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Oldest
              </button>
            </div>

            {/* Search/Filter */}
            <div className="relative w-full sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-gray-100/70 border-none rounded-full py-2 pl-9 pr-9 text-sm text-on-surface placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-white transition-all"
                placeholder="Filter by title..."
                type="text"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText("")}
                  aria-label="Clear filter"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          <NewsFeed
            articles={filteredAndSorted}
            featured={false}
            emptyMessage="No bookmarked stories match your search"
          />
        </>
      )}
    </div>
  );
}
