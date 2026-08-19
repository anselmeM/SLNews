"use client";

import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { instantSearch, type InstantSearchResult } from "@/app/actions/search-actions";
import { vibrateLight } from "@/lib/haptics";

const TRENDING_TOPICS = ["National", "Politics", "Economy", "Bo Market", "Freetown", "Fuel"];

function getInitialRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("slnews-recent-searches");
    return saved ? JSON.parse(saved).slice(0, 5) : [];
  } catch {
    return [];
  }
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InstantSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(getInitialRecentSearches);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Global shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent("slnews:toggle-search"));
        }
      }
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      const timer = setTimeout(() => {
        setResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await instantSearch(trimmed);
        setResults(data);
        setSelectedIndex(0);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("slnews-recent-searches", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSelectArticle = (articleId: string, title: string) => {
    vibrateLight();
    saveRecentSearch(title);
    setQuery("");
    setResults([]);
    onClose();
    router.push(`/article/${articleId}`);
  };

  const handleFullSearch = (searchTerm: string) => {
    vibrateLight();
    saveRecentSearch(searchTerm);
    setQuery("");
    setResults([]);
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDownNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectArticle(results[selectedIndex].id, results[selectedIndex].title);
      } else if (query.trim()) {
        handleFullSearch(query.trim());
      }
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("slnews-recent-searches");
    } catch {
      // Ignore
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24">
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-outline-variant/40 gap-3 bg-surface-container-low">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                search
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownNav}
                placeholder="Search breaking news, topics, regions... (e.g. Freetown, Rice, Fuel)"
                className="w-full bg-transparent text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  aria-label="Clear input"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-surface-container-high text-on-surface-variant rounded border border-outline-variant/40">
                ESC
              </kbd>
            </div>

            {/* Results / Suggestions Container */}
            <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4">
              {isPending && (
                <div className="flex items-center justify-center py-6 text-xs font-semibold text-on-surface-variant gap-2">
                  <span className="material-symbols-outlined animate-spin text-base">
                    progress_activity
                  </span>
                  Searching stories...
                </div>
              )}

              {/* Instant Search Results */}
              {!isPending && results.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-3 py-1">
                    Matching Stories ({results.length})
                  </div>
                  {results.map((art, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => handleSelectArticle(art.id, art.title)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 text-on-surface"
                            : "hover:bg-surface-container-low text-on-surface"
                        }`}
                      >
                        {art.imageUrl && (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container shrink-0">
                            <Image
                              src={art.imageUrl}
                              alt={art.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.2 bg-surface-container-high rounded text-primary">
                              {art.category}
                            </span>
                            <span className="text-[11px] text-on-surface-variant font-medium truncate">
                              {art.source}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                            {art.title}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-sm text-on-surface-variant shrink-0">
                          arrow_forward
                        </span>
                      </button>
                    );
                  })}

                  {/* See full search results button */}
                  <button
                    type="button"
                    onClick={() => handleFullSearch(query)}
                    className="w-full mt-2 p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View all search results for &ldquo;{query}&rdquo;</span>
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </button>
                </div>
              )}

              {/* No results for query */}
              {!isPending && query.trim().length >= 2 && results.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/60">
                    search_off
                  </span>
                  <p className="text-sm font-semibold text-on-surface">
                    No matching stories found
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Try searching for broader keywords like &ldquo;Freetown&rdquo;, &ldquo;Economy&rdquo;, or &ldquo;Sports&rdquo;
                  </p>
                </div>
              )}

              {/* Zero-Query State: Recent Searches & Trending Topics */}
              {!query && (
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
                        <span>Recent Searches</span>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-primary hover:underline lowercase font-semibold"
                        >
                          clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setQuery(term);
                              handleFullSearch(term);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs text-on-surface-variant">
                              history
                            </span>
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Topics */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      Trending in Sierra Leone
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setQuery(topic);
                            handleFullSearch(topic);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-primary/10 hover:text-primary border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">trending_up</span>
                          <span>{topic}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Key Navigation Guide */}
            <div className="px-4 py-2.5 border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40">↑</kbd>
                  <kbd className="font-mono bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40">↓</kbd>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40">↵</kbd>
                  <span>to select</span>
                </span>
              </div>
              <Link
                href="/search"
                onClick={onClose}
                className="text-primary hover:underline font-bold"
              >
                Advanced Search
              </Link>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
