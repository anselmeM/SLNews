"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ArticleImage from "./ArticleImage";
import BookmarkButton from "./BookmarkButton";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

export default function ArticleCard({ article }: { article: NewsArticle }) {
  const dataSaver = useAppStore((state) => state.dataSaver);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.04)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface-container-lowest rounded-3xl p-3 flex gap-4 transition-shadow duration-300 group relative cursor-pointer"
    >
      <Link href={`/article/${article.id}`} className="flex-1 flex gap-4 w-full items-center" aria-label={article.title}>
        {!dataSaver && (
          <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 relative bg-surface-container">
            <ArticleImage
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 112px, 112px"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        )}
        {dataSaver && (
          <div className="w-28 h-28 rounded-2xl shrink-0 bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-outline">data_saver_on</span>
          </div>
        )}
        
        <div className="flex-1 py-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-label-sm text-[11px] font-semibold text-primary uppercase tracking-wide">
              {article.location || article.category}
            </span>
          </div>
          <h3 className="font-headline-sm text-base sm:text-lg leading-snug font-bold mb-1.5 group-hover:text-primary transition-colors duration-200 text-on-surface pr-8 line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-xs">
            <span className="truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px] font-medium">{article.source || "News"}</span>
            <span>•</span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </Link>
      
      <BookmarkButton article={article} variant="card" />
    </motion.article>
  );
}
