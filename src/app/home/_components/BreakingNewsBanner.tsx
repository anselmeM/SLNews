import Link from "next/link";
import { db } from "@/lib/db";
import { mapPrismaArticle } from "@/lib/news-service";

const BREAKING_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export default async function BreakingNewsBanner() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - BREAKING_WINDOW_MS);

  const article = await db.article.findFirst({
    where: {
      status: "PUBLISHED",
      published: true,
      breaking: true,
      publishedAt: { gte: cutoff },
      categories: { some: { name: "National" } },
    },
    orderBy: { publishedAt: "desc" },
    include: { author: true, categories: true },
  });

  if (!article) return null;

  // Rule 4: requires image + summary
  if (!article.imageUrl || !article.summary) return null;

  const mapped = mapPrismaArticle(article);

  return (
    <Link href={`/article/${mapped.id}`} className="block mb-8">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 overflow-hidden relative hover:border-red-300 transition-colors">
        <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-amber-400/20 to-red-500/10 animate-pulse" />
        <span className="relative z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shrink-0">
          Breaking
        </span>
        <span className="relative z-10 font-bold text-red-800 text-sm md:text-base truncate">
          {mapped.title}
        </span>
        <span className="material-symbols-outlined relative z-10 text-red-500 ml-auto shrink-0">arrow_forward</span>
      </div>
    </Link>
  );
}
