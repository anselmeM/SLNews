"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ArticleImage from "./ArticleImage";
import BookmarkButton from "./BookmarkButton";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

export default function FeaturedArticleCard({ article }: { article: NewsArticle }) {
  const dataSaver = useAppStore((state) => state.dataSaver);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl shadow-md overflow-hidden mb-6 group cursor-pointer relative h-[260px] sm:h-[340px] md:h-[400px]"
    >
      <Link href={`/article/${article.id}`} className="block w-full h-full" aria-label={article.title}>
        {!dataSaver && (
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            className="object-cover group-hover:scale-105 transition-transform duration-[1000ms] ease-out"
          />
        )}
        {dataSaver && (
          <div className="absolute inset-0 bg-surface-container flex items-center justify-center flex-col gap-2">
            <span className="material-symbols-outlined text-outline text-4xl">data_saver_on</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Image hidden</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-95" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-5 md:p-6 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary text-white px-3 py-1 rounded-full font-label-sm text-[11px] font-bold tracking-wide uppercase">
              {article.category || "Top Story"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-2 text-white/80 text-sm">
            <span className="font-medium">{new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>
          
          <h2 className="font-headline-sm md:font-headline-md text-xl md:text-2xl font-bold leading-snug group-hover:text-gray-200 transition-colors duration-200 line-clamp-3">
            {article.title}
          </h2>
        </div>
      </Link>
      
      {/* Bookmark Button */}
      <BookmarkButton article={article} variant="featured" />
    </motion.article>
  );
}
