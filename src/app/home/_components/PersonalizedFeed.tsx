"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPersonalizedNews, getUnseenNews } from "@/app/actions/feed-actions";
import NewsFeed from "@/components/NewsFeed";
import PullToRefresh from "@/components/PullToRefresh";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

const PAGE_SIZE = 10;

export default function PersonalizedFeed({ fallbackArticles, isAuthenticated }: { fallbackArticles: NewsArticle[]; isAuthenticated: boolean }) {
  const { preferredRegion, preferredTopics, seenArticleIds, addSeenArticles } = useAppStore();
  const hasPrefs = !!(preferredRegion || (preferredTopics && preferredTopics.length > 0));
  const shouldPersonalize = isAuthenticated && hasPrefs;
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [loading, setLoading] = useState(shouldPersonalize);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(shouldPersonalize);
  const [error, setError] = useState(false);
  const skipRef = useRef(0);
  const seenRef = useRef(false);

  const doFetch = useRef(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!shouldPersonalize) return;
    let cancelled = false;
    (async () => {
      if (!initialLoad.current) {
        setLoading(true);
      }
      initialLoad.current = false;
      setError(false);
      try {
        const skip = doFetch.current ? skipRef.current + PAGE_SIZE : 0;
        const data = await getPersonalizedNews(preferredRegion, preferredTopics, skip, PAGE_SIZE + 1);
        if (cancelled) return;
        const hasMorePages = data.length > PAGE_SIZE;
        if (hasMorePages) data.pop();
        if (doFetch.current) {
          setArticles(prev => [...prev, ...data]);
          skipRef.current = skip;
        } else {
          setArticles(data);
          skipRef.current = 0;
        }
        setHasMore(hasMorePages);
        if (!doFetch.current && !seenRef.current) {
          seenRef.current = true;
          addSeenArticles(data.map(a => a.id));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching personalized news:", err);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredRegion, preferredTopics]);

  const handleRefresh = useCallback(async () => {
    const fresh = await getUnseenNews(seenArticleIds, PAGE_SIZE);
    if (fresh.length === 0) return "empty" as const;
    addSeenArticles(fresh.map(a => a.id));
    setArticles(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const unique = fresh.filter(a => !existingIds.has(a.id));
      return [...unique, ...prev];
    });
    return "ok" as const;
  }, [seenArticleIds, addSeenArticles]);

  useAutoRefresh(handleRefresh);

  const retry = () => {
    doFetch.current = false;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const data = await getPersonalizedNews(preferredRegion, preferredTopics, 0, PAGE_SIZE + 1);
        const hasMorePages = data.length > PAGE_SIZE;
        if (hasMorePages) data.pop();
        setArticles(data);
        setHasMore(hasMorePages);
        skipRef.current = 0;
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  };

  const loadMore = useCallback(() => {
    doFetch.current = true;
    setLoadingMore(true);
    (async () => {
      try {
        const skip = skipRef.current + PAGE_SIZE;
        const data = await getPersonalizedNews(preferredRegion, preferredTopics, skip, PAGE_SIZE + 1);
        const hasMorePages = data.length > PAGE_SIZE;
        if (hasMorePages) data.pop();
        addSeenArticles(data.map(a => a.id));
        setArticles(prev => [...prev, ...data]);
        setHasMore(hasMorePages);
        skipRef.current = skip;
      } catch (err) {
        console.error("Error loading more:", err);
      } finally {
        setLoadingMore(false);
      }
    })();
  }, [preferredRegion, preferredTopics, addSeenArticles]);

  if (error) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">error</span>
          <p className="font-semibold text-sm text-on-surface mb-3">Failed to load feed</p>
          <button
            onClick={retry}
            className="px-6 py-2 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </PullToRefresh>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-on-surface-variant animate-pulse font-body-md">Personalizing your feed...</div>;
  }

  if (articles.length === 0) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">feed</span>
          <p className="font-body-md">We couldn&apos;t find any recent stories matching your preferences.</p>
          <p className="font-body-sm mt-2 opacity-70">Try adjusting your interests in settings.</p>
        </div>
      </PullToRefresh>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <NewsFeed
        articles={articles}
        emptyMessage="We couldn't find any recent stories matching your preferences."
        emptyIcon="feed"
        loadMoreLabel={hasMore ? "Load More Stories" : undefined}
        onLoadMore={hasMore ? loadMore : undefined}
        loadingMore={loadingMore}
      />
    </PullToRefresh>
  );
}
