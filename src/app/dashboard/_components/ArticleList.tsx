"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteArticle } from "@/app/actions/article-actions";
import { useToast } from "@/components/Toast";
import type { DashboardArticle } from "@/lib/types";

export default function ArticleList({
  articles,
  onEdit,
  emptyMessage,
}: {
  articles: DashboardArticle[];
  onEdit: (article: DashboardArticle) => void;
  emptyMessage: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (article: DashboardArticle) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    setDeleting(article.id);
    try {
      await deleteArticle(article.id);
      router.refresh();
      toast("Article deleted", "success");
    } catch {
      toast("Failed to delete article", "error");
    }
    setDeleting(null);
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 bg-surface-container-lowest rounded-2xl border border-outline-variant">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
        <p className="font-semibold text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-outline-variant shadow-sm group"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-on-surface leading-snug truncate">{article.title}</h3>
            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="uppercase tracking-wide font-semibold">{article.status.replace("_", " ")}</span>
              <span>•</span>
              {new Date(article.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {article.categories?.[0]?.name && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[100px]">{article.categories[0].name}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onEdit(article)}
              className="px-4 py-2 rounded-full font-semibold text-xs bg-primary-container text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer min-h-[44px]"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(article)}
              disabled={deleting === article.id}
              className="px-4 py-2 rounded-full font-semibold text-xs bg-transparent border border-outline-variant text-on-surface-variant hover:bg-error-container hover:text-error hover:border-error transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {deleting === article.id ? "..." : "Delete"}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
