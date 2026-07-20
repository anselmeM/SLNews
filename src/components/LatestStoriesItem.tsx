"use client";

import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";
import { useAppStore } from "@/store/useAppStore";
import type { NewsArticle } from "@/lib/news-service";

export function LatestItem({ article }: { article: NewsArticle }) {
  const dataSaver = useAppStore((s) => s.dataSaver);

  return (
    <Link
      href={`/article/${article.id}`}
      className="flex-shrink-0 w-[220px] sm:w-[260px] group rounded-2xl overflow-hidden relative"
    >
      <div className="aspect-[16/10] bg-surface-container rounded-xl overflow-hidden relative">
        {dataSaver ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-4xl text-outline">data_saver_on</span>
          </div>
        ) : (
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="260px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
            {article.category}
          </span>
          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug mt-0.5">
            {article.title}
          </h4>
        </div>
      </div>
    </Link>
  );
}
