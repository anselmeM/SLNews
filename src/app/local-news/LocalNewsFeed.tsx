"use client";

import { useCallback } from "react";
import { getLocalNewsPage } from "@/app/actions/feed-actions";
import PaginatedNewsFeed from "@/components/PaginatedNewsFeed";
import type { NewsArticle } from "@/lib/news-service";

export default function LocalNewsFeed({ initialArticles }: { initialArticles: NewsArticle[] }) {
  const fetchPage = useCallback(
    (skip: number, take: number) => getLocalNewsPage(skip, take),
    []
  );
  return (
    <PaginatedNewsFeed
      initialArticles={initialArticles}
      fetchPage={fetchPage}
      emptyMessage="No local or national articles found."
    />
  );
}
