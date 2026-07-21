import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";
import DataSaverGuard from "@/components/DataSaverGuard";
import { db } from "@/lib/db";
import { mapPrismaArticle } from "@/lib/news-service";

export default async function EditorsPicks() {
  let articles: Awaited<ReturnType<typeof db.article.findMany>> = [];
  try {
    articles = await db.article.findMany({
      where: { status: "PUBLISHED", published: true },
      take: 3,
      orderBy: { updatedAt: "desc" },
      include: { author: true, categories: true },
    });
  } catch {
    return null;
  }

  if (articles.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide mb-3">
        Editor&apos;s Picks
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {articles.map((article) => {
          const mapped = mapPrismaArticle(article);
          return (
            <Link
              key={mapped.id}
              href={`/article/${mapped.id}`}
              className="shrink-0 w-40 rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <DataSaverGuard>
                  <ArticleImage
                    src={mapped.imageUrl}
                    alt={mapped.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </DataSaverGuard>
              </div>
              <p className="p-2.5 text-xs font-semibold text-on-surface line-clamp-2 leading-snug">
                {mapped.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
