import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AuthorBioCard from "./_components/AuthorBioCard";
import CommentSection from "./_components/CommentSection";
import ArticleActions from "@/components/ArticleActions";
import ArticleCard from "@/components/ArticleCard";
import ArticleImage from "@/components/ArticleImage";
import DataSaverGuard from "@/components/DataSaverGuard";
import FABSave from "@/components/FABSave";
import ReactionButtons from "@/components/ReactionButtons";
import TrackArticleView from "@/components/TrackArticleView";
import { fetchArticleById, fetchRelatedArticles } from "@/lib/news-service";

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
      {related.slice(0, 2).map((rel) => (
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

  return (
    <div className="pt-2 md:pt-4 max-w-[800px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 py-4 text-on-surface-variant font-label-sm text-label-sm">
        <Link className="hover:text-primary transition-colors font-medium" href="/home">Home</Link>
        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
        <Link className="hover:text-primary transition-colors font-medium" href="/news">{article.category}</Link>
        {article.location && (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
            <span className="text-on-surface font-bold">{article.location}</span>
          </>
        )}
      </nav>

      {/* Article Header */}
      <article className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/50 shadow-sm overflow-hidden mb-8">
        <div className="p-0">
          {/* Geographic Tag */}
          <div className="inline-block bg-primary-container text-primary px-3 py-1 rounded-full font-label-sm text-xs font-bold uppercase tracking-wide mb-4">
            {article.location || article.category}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-on-surface mb-6 tracking-tight leading-tight">
            {article.title}
          </h1>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden relative flex items-center justify-center">
                {article.sourceImage ? (
                  <img
                    src={
                      article.sourceImage.startsWith("/")
                        ? article.sourceImage
                        : `/api/image-proxy?url=${encodeURIComponent(article.sourceImage)}`
                    }
                    alt={`${article.source} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-on-surface-variant">
                    {(article.source || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-on-surface">By {article.source}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-0.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
            
            <ArticleActions article={article} />
          </div>
          
          {/* Hero Image */}
          <figure className="mb-8">
            <div className="w-full aspect-video bg-gray-100 rounded-3xl overflow-hidden relative group shadow-sm">
              <DataSaverGuard className="absolute inset-0">
                <ArticleImage
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </DataSaverGuard>
            </div>
          </figure>
          
            {/* Article Body — plain text only. If rich HTML is ever stored, use DOMPurify before rendering. */}
            <div className="text-base md:text-lg text-on-surface space-y-6 leading-relaxed font-normal">
            {article.summary && (
              <p className="text-xl font-medium text-on-surface-variant leading-relaxed">
                {article.summary}
              </p>
            )}
            <div className="whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
          
          {/* Tags & Engagement */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-surface-variant px-3 py-1 rounded-full font-semibold text-xs text-on-surface-variant">{article.category}</span>
              {article.location && (
                <span className="bg-surface-variant px-3 py-1 rounded-full font-semibold text-xs text-on-surface-variant">{article.location}</span>
              )}
            </div>
            <ReactionButtons articleId={article.id} />
          </div>
        </div>
      </article>
      
      {/* Author Bio Card */}
      <Suspense fallback={null}>
        <AuthorBioCard authorId={article.authorId} />
      </Suspense>
      
      {/* Related Stories */}
      <section className="mb-12">
        <h3 className="text-lg font-bold text-on-surface mb-4">Related Stories</h3>
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        }>
          <RelatedStories excludeId={article.id} category={article.category} />
        </Suspense>
      </section>

      <CommentSection articleId={article.id} />
      <TrackArticleView article={article} />
      <FABSave article={article} />
    </div>
  );
}
