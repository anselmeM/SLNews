import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import ComingSoonButton from "@/components/ComingSoonButton";
import { db } from "@/lib/db";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const author = await db.user.findUnique({ where: { id } });
  if (!author) return { title: "Contributor Not Found | SLNews" };
  return {
    title: `${author.name || "Contributor"} | SLNews Contributor`,
    description: `Articles by ${author.name || "a contributor"} on SLNews.`,
  };
}

export default async function ContributorProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const author = await db.user.findUnique({
    where: { id },
    include: {
      _count: { select: { articles: true } },
    },
  });

  if (!author) {
    notFound();
  }

  const articles = await db.article.findMany({
    where: { authorId: id, published: true, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      categories: true,
      author: true,
    },
    take: 5,
  });

  const publishedCount = author._count.articles;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm p-6 relative overflow-hidden border border-outline-variant/30 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div className="absolute top-0 left-0 w-full h-24 bg-surface-container-highest -z-10"></div>
          <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest shadow-lg overflow-hidden flex-shrink-0 z-10 mt-2 sm:mt-8 relative bg-primary-container flex items-center justify-center">
            <span className="text-4xl font-black text-on-primary-container uppercase">
              {author.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-grow z-10 sm:mt-12">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="font-headline-md text-headline-md text-on-surface">
                {author.name || "Unknown Contributor"}
              </h1>
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Verified Journalist"
              >
                verified
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              {author.role} contributor at SLNews.
            </p>
            <ComingSoonButton message="Following coming soon!" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-full shadow-sm hover:bg-primary/95 transition-colors flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined">notifications_active</span> Follow
            </ComingSoonButton>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center h-full">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">
              military_tech
            </span>
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Role
            </h3>
            <div className="font-headline-sm text-headline-sm text-on-surface">
              {author.role}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col items-center justify-center border border-outline-variant/30">
            <div className="font-display-lg-mobile text-display-lg-mobile text-primary">
              {publishedCount}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-center">
              Stories Published
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">
          Recent Reporting
        </h2>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
              article
            </span>
            <p className="font-body-md">No published articles yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <div key={article.id}>
                <ArticleCard
                  article={{
                    id: article.id,
                    title: article.title,
                    summary: article.summary || "",
                    content: article.content,
                    imageUrl: article.imageUrl || "/globe.svg",
                    category: article.categories[0]?.name || "General",
                    source: author.name || "SLNews Contributor",
                    publishedAt: article.publishedAt
                      ? article.publishedAt.toISOString()
                      : article.createdAt.toISOString(),
                    authorId: article.authorId,
                  }}
                />
                <div className="w-full h-px bg-surface-variant my-2"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
