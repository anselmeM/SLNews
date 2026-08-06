"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getHomeFeed, getUnseenNews } from "@/app/actions/feed-actions";
import NewsFeed from "@/components/NewsFeed";
import PullToRefresh from "@/components/PullToRefresh";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

const PAGE_SIZE = 10;

/**
 * The home feed — always a fixed mix of international + national news,
 * regardless of topic preferences. Supports "More Articles" pagination and
 * pull-to-refresh.
 */
export default function HomeFeed({ fallbackArticles }: { fallbackArticles: NewsArticle[] }) {
  const { seenArticleIds, addSeenArticles } = useAppStore();
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [hasMore, setHasMore] = useState(fallbackArticles.length >= PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const skipRef = useRef(fallbackArticles.length);
  const fetchingRef = useRef(false);
  // Mirrors `articles` so refresh can compute the next server offset without
  // reading state that hasn't been committed yet.
  const articlesRef = useRef<NewsArticle[]>(fallbackArticles);
  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const data = await getHomeFeed(skipRef.current, PAGE_SIZE + 1);
      const hasMorePages = data.length > PAGE_SIZE;
      if (hasMorePages) data.pop();
      setArticles((prev) => {
        const existing = new Set(prev.map((a) => a.id));
        const unique = data.filter((a) => !existing.has(a.id));
        return [...prev, ...unique];
      });
      // Skip + probe pagination: advance by the full page even if dedup
      // dropped overlaps, so the server offset stays aligned.
      skipRef.current += PAGE_SIZE;
      setHasMore(hasMorePages);
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  const handleRefresh = useCallback(async (): Promise<"ok" | "empty" | "error"> => {
    if (fetchingRef.current) return "error"; // loadMore in flight — skip
    fetchingRef.current = true;
    try {
      const fresh = await getUnseenNews(seenArticleIds, PAGE_SIZE);
      if (fresh.length === 0) return "empty";
      const existing = new Set(articlesRef.current.map((a) => a.id));
      const unique = fresh.filter((a) => !existing.has(a.id));
      const merged = [...unique, ...articlesRef.current];
      articlesRef.current = merged;
      setArticles(merged);
      setLoadMoreError(false);
      addSeenArticles(fresh.map((a) => a.id));
      setHasMore(fresh.length >= PAGE_SIZE);
      skipRef.current = merged.length;
      return "ok";
    } catch {
      return "error";
    } finally {
      fetchingRef.current = false;
    }
  }, [seenArticleIds, addSeenArticles]);

  useAutoRefresh(handleRefresh);

  if (articles.length === 0) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">feed</span>
          <p className="font-body-md">We couldn&apos;t find any recent stories.</p>
          <p className="font-body-sm mt-2 opacity-70">Pull down to refresh.</p>
        </div>
      </PullToRefresh>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <NewsFeed
        articles={articles}
        emptyMessage="We couldn't find any recent stories."
        emptyIcon="feed"
        loadMoreLabel={hasMore ? "More Stories" : undefined}
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
