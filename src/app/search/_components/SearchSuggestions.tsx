"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const STORAGE_KEY = "slnews-recent-searches";
const MAX_ITEMS = 5;

export default function SearchSuggestions({ currentQuery }: { currentQuery: string }) {
  const [recent, setRecent] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const savedRef = useRef<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || !currentQuery || savedRef.current === currentQuery) return;
    savedRef.current = currentQuery;
    setRecent((prev) => {
      const updated = [currentQuery, ...prev.filter((r) => r !== currentQuery)].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [currentQuery, mounted]);

  if (!mounted || currentQuery || recent.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Recent Searches</h2>
      <div className="flex flex-wrap gap-2">
        {recent.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
          >
            {term}
          </Link>
        ))}
      </div>
    </section>
  );
}
