"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NewsFeed from "@/components/NewsFeed";
import PullToRefresh from "@/components/PullToRefresh";
import type { NewsArticle } from "@/lib/news-service";

const PAGE_SIZE = 10;

type FetchPage = (skip: number, take: number) => Promise<NewsArticle[]>;

/**
 * Infinite/paginated news feed with pull-to-refresh:
 * - a "More Articles" button at the end loads the next page (appended, deduped)
 * - pulling down refreshes with the newest articles (prepended, deduped)
 */
export default function PaginatedNewsFeed({
  initialArticles,
  fetchPage,
  emptyMessage,
}: {
  initialArticles: NewsArticle[];
  fetchPage: FetchPage;
  emptyMessage: string;
}) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [hasMore, setHasMore] = useState(initialArticles.length >= PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const skipRef = useRef(initialArticles.length);
  const fetchingRef = useRef(false);
  // Mirrors `articles` so refresh can compute the next server offset without
  // reading state that hasn't been committed yet.
  const articlesRef = useRef<NewsArticle[]>(initialArticles);
  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const data = await fetchPage(skipRef.current, PAGE_SIZE + 1);
      const hasMorePages = data.length > PAGE_SIZE;
      if (hasMorePages) data.pop();
      setArticles((prev) => {
        const existing = new Set(prev.map((a) => a.id));
        const unique = data.filter((a) => !existing.has(a.id));
        return [...prev, ...unique];
      });
      // Skip + probe pagination: advance by the full page even if dedup
      // dropped overlaps, so the server offset stays aligned. Occasional
      // skips are acceptable for a news feed.
      skipRef.current += PAGE_SIZE;
      setHasMore(hasMorePages);
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [fetchPage]);

  const handleRefresh = useCallback(async (): Promise<"ok" | "empty" | "error"> => {
    if (fetchingRef.current) return "error"; // loadMore in flight — skip
    fetchingRef.current = true;
    try {
      const fresh = await fetchPage(0, PAGE_SIZE);
      if (fresh.length === 0) return "empty";
      const existing = new Set(articlesRef.current.map((a) => a.id));
      const unique = fresh.filter((a) => !existing.has(a.id));
      const merged = [...unique, ...articlesRef.current];
      articlesRef.current = merged;
      setArticles(merged);
      setLoadMoreError(false);
      // A full fresh page means more content likely exists beyond what's
      // shown — re-enable the More button even if the feed was short before.
      setHasMore(fresh.length >= PAGE_SIZE);
      skipRef.current = merged.length;
      return "ok";
    } catch {
      return "error";
    } finally {
      fetchingRef.current = false;
    }
  }, [fetchPage]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <NewsFeed
        articles={articles}
        emptyMessage={emptyMessage}
        loadMoreLabel={hasMore ? "More Articles" : undefined}
        onLoadMore={hasMore ? loadMore : undefined}
        loadingMore={loadingMore}
      />
      {loadMoreError && (
        <p className="text-center text-sm text-error mb-4">
          Couldn&apos;t load more articles. Pull to refresh and try again.
        </p>
      )}
    </PullToRefresh>
  );
}
