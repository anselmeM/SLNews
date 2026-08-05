"use client";

import { useCallback } from "react";
import { getWorldNewsPage } from "@/app/actions/feed-actions";
import PaginatedNewsFeed from "@/components/PaginatedNewsFeed";
import type { NewsArticle } from "@/lib/news-service";

export default function WorldNewsFeed({
  initialArticles,
  topic,
}: {
  initialArticles: NewsArticle[];
  topic: string;
}) {
  const fetchPage = useCallback(
    (skip: number, take: number) => getWorldNewsPage(topic, skip, take),
    [topic]
  );
  return (
    <PaginatedNewsFeed
      initialArticles={initialArticles}
      fetchPage={fetchPage}
      emptyMessage={`No articles found for ${topic}.`}
    />
  );
}
