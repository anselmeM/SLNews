"use client";

import { useState, useCallback } from "react";
import { getLocalNewsPage } from "@/app/actions/feed-actions";
import PaginatedNewsFeed from "@/components/PaginatedNewsFeed";
import SierraLeoneDistrictMap from "@/components/SierraLeoneDistrictMap";
import type { NewsArticle } from "@/lib/news-service";

export default function LocalNewsFeed({ initialArticles }: { initialArticles: NewsArticle[] }) {
  const [province, setProvince] = useState<string | undefined>();
  const [district, setDistrict] = useState<string | undefined>();
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [loading, setLoading] = useState(false);

  const handleSelectRegion = useCallback(async (newProvince?: string, newDistrict?: string) => {
    setProvince(newProvince);
    setDistrict(newDistrict);
    setLoading(true);
    try {
      const results = await getLocalNewsPage(0, 10, newProvince, newDistrict);
      setArticles(results);
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPage = useCallback(
    (skip: number, take: number) => getLocalNewsPage(skip, take, province, district),
    [province, district]
  );

  return (
    <div className="space-y-6">
      <SierraLeoneDistrictMap
        selectedProvince={province}
        selectedDistrict={district}
        onSelectRegion={handleSelectRegion}
        articleCount={articles.length}
      />

      {loading ? (
        <div className="py-12 text-center text-on-surface-variant animate-pulse font-medium text-sm">
          Loading stories for {district || province || "Sierra Leone"}...
        </div>
      ) : (
        <PaginatedNewsFeed
          key={`${province}-${district}`}
          initialArticles={articles}
          fetchPage={fetchPage}
          emptyMessage={
            district || province
              ? `No stories found for ${district || province}. Try selecting another district or resetting to All Sierra Leone.`
              : "No national articles found."
          }
        />
      )}
    </div>
  );
}
