import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShareSheet from "./_components/ShareSheet";
import CommentSection from "./_components/CommentSection";
import ListenButton from "@/components/ListenButton";
import ArticleCard from "@/components/ArticleCard";
import ArticleImage from "@/components/ArticleImage";
import DataSaverGuard from "@/components/DataSaverGuard";
import FABSave from "@/components/FABSave";
import ReactionButtons from "@/components/ReactionButtons";
import ReadingProgress from "@/components/ReadingProgress";
import { ShimmerFeed } from "@/components/Shimmer";
import TrackArticleView from "@/components/TrackArticleView";
import { fetchArticleById, fetchRelatedArticles } from "@/lib/news-service";
import { ArticleBody } from "./_components/ArticleBody";
import { StickyActions } from "./_components/StickyActions";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const article = await fetchArticleById(id);
  if (!article) return { title: "Article Not Found | SLNews" };
  return {
    title: `${article.title} | SLNews`,
    description: article.summary || `Read ${article.title} on SLNews.`,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
  };
}

async function RelatedStories({ excludeId, category }: { excludeId: string; category: string }) {
  const related = await fetchRelatedArticles(excludeId, category);
  return (
    <div className="flex flex-col gap-4">
      {related.slice(0, 3).map((rel) => (
        <div key={rel.id}>
          <ArticleCard article={rel} />
        </div>
      ))}
    </div>
  );
}

export default async function ArticlePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const article = await fetchArticleById(params.id);

  if (!article) {
    notFound();
  }

  const readingTime = Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200));
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-[720px] mx-auto">
      <ReadingProgress />

      {/* Hero Image — full-width, edge-to-edge */}
      <figure className="relative w-full aspect-[16/9] md:aspect-[2/1] md:rounded-2xl overflow-hidden bg-surface-container -mx-4 sm:-mx-6 lg:mx-0">
        <DataSaverGuard className="absolute inset-0">
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </DataSaverGuard>
        {article.location && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
            {article.location}
          </span>
        )}
      </figure>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 py-3 text-xs font-medium text-on-surface-variant/70">
        <Link className="hover:text-primary transition-colors" href="/home">Home</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link className="hover:text-primary transition-colors" href="/news">{article.category}</Link>
      </nav>

      {/* Category + headline */}
      <div className="mb-4">
        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
          {article.category}
        </span>
        <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-black text-on-surface tracking-tight leading-[1.15]">
          {article.title}
        </h1>
      </div>

      {/* Author byline + actions */}
      <div className="flex items-center justify-between py-3 border-b border-outline-variant/20 mb-6">
        <div>
          <p className="font-semibold text-sm text-on-surface">
            {article.source}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {formattedDate} · {readingTime} min read
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ListenButton title={article.title} content={article.content} />
          <ShareSheet article={article} />
        </div>
      </div>

      {/* Summary — editorial pull quote style */}
      {article.summary && (
        <p className="text-lg sm:text-xl font-medium text-on-surface-variant leading-relaxed mb-8 pl-4 border-l-[3px] border-primary/30">
          {article.summary}
        </p>
      )}

      {/* Article body */}
      <ArticleBody content={article.content} />

      {/* Tags & reactions */}
      <div className="mt-8 pt-6 border-t border-outline-variant/20">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-surface-container px-3 py-1.5 rounded-full font-semibold text-xs text-on-surface-variant">{article.category}</span>
          {article.location && (
            <span className="bg-surface-container px-3 py-1.5 rounded-full font-semibold text-xs text-on-surface-variant">{article.location}</span>
          )}
        </div>
        <ReactionButtons articleId={article.id} />
      </div>

      {/* Related Stories */}
      <section className="mt-12 mb-8">
        <h3 className="text-lg font-bold text-on-surface mb-4">Related Stories</h3>
        <Suspense fallback={<ShimmerFeed count={3} />}>
          <RelatedStories excludeId={article.id} category={article.category} />
        </Suspense>
      </section>

      <CommentSection articleId={article.id} />
      <TrackArticleView article={article} />

      {/* Sticky bottom bar for quick actions */}
      <StickyActions article={article} />
    </div>
  );
}
