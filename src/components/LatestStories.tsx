import Link from "next/link";
import { fetchTrendingNews, type NewsArticle } from "@/lib/news-service";
import ArticleImage from "@/components/ArticleImage";

async function LatestItem({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="flex-shrink-0 w-[220px] sm:w-[260px] group rounded-2xl overflow-hidden relative"
    >
      <div className="aspect-[16/10] bg-surface-container rounded-xl overflow-hidden relative">
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="260px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
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

export default async function LatestStories() {
  let articles: NewsArticle[] = [];
  try {
    articles = await fetchTrendingNews(0, 8);
  } catch {
    return null;
  }

  if (articles.length < 3) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-on-surface">Latest</h2>
        <Link href="/news" className="text-xs font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {articles.map((a) => (
          <LatestItem key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
