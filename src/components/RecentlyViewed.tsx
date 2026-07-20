"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import ArticleImage from "@/components/ArticleImage";

export default function RecentlyViewed() {
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const dataSaver = useAppStore((s) => s.dataSaver);

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide mb-3">
        Recently Viewed
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {recentlyViewed.map((a) => (
          <Link
            key={a.id}
            href={`/article/${a.id}`}
            className="shrink-0 w-40 rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
              {!dataSaver && a.imageUrl ? (
                <ArticleImage
                  src={a.imageUrl}
                  alt={a.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : dataSaver ? (
                <div className="w-full h-full flex items-center justify-center bg-surface-container">
                  <span className="material-symbols-outlined text-3xl text-outline">data_saver_on</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-3xl">article</span>
                </div>
              )}
            </div>
            <p className="p-2.5 text-xs font-semibold text-on-surface line-clamp-2 leading-snug">
              {a.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
