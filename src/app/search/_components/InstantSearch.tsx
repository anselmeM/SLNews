"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { instantSearch } from "@/app/actions/search-actions";

interface Suggestion {
  id: string;
  title: string;
  category: string;
}

export default function InstantSearch() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    const results = await instantSearch(q);
    setSuggestions(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (input.length < 2) return;
    debounceRef.current = setTimeout(() => fetchSuggestions(input), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
        <input
          value={input}
          onChange={(e) => {
            const nextInput = e.target.value;
            setInput(nextInput);
            if (nextInput.length < 2) setSuggestions([]);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search articles..."
          className="w-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          autoComplete="off"
        />
        {input && (
          <button
            type="button"
            onClick={() => { setInput(""); setSuggestions([]); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
          </button>
        )}
      </form>

      {focused && input.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface dark:bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-lg overflow-hidden z-50">
          {loading && (
            <div className="px-4 py-3 text-xs text-on-surface-variant animate-pulse">Searching...</div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-xs text-on-surface-variant">No results for &ldquo;{input}&rdquo;</div>
          )}
          {!loading && suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/article/${s.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/10 last:border-b-0"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">article</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{s.title}</p>
                <p className="text-xs text-on-surface-variant">{s.category}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">north_east</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
