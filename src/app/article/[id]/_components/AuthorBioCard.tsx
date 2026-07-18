import Link from "next/link";
import DataSaverGuard from "@/components/DataSaverGuard";
import { db } from "@/lib/db";

export default async function AuthorBioCard({ authorId }: { authorId: string }) {
  const author = await db.user.findUnique({
    where: { id: authorId },
    select: {
      name: true,
      image: true,
      role: true,
      bio: true,
      _count: { select: { articles: true } },
    },
  });

  if (!author) return null;

  const articleCount = author._count?.articles ?? 0;

  return (
    <section className="mb-8">
      <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-variant overflow-hidden shrink-0">
            <DataSaverGuard className="w-full h-full rounded-full" iconSize="text-lg">
              {author.image ? (
                <img
                  src={
                    author.image.startsWith("/")
                      ? author.image
                      : `/api/image-proxy?url=${encodeURIComponent(author.image)}`
                  }
                  alt={author.name || "Author"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                  {(author.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
            </DataSaverGuard>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface">
              {author.name || "SLNews Contributor"}
            </p>
            <p className="text-xs text-primary font-semibold uppercase tracking-wide">
              {author.role}
            </p>
            {author.bio && (
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {author.bio}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-on-surface-variant">
                <span className="font-semibold">{articleCount}</span>{" "}
                article{articleCount !== 1 ? "s" : ""}
              </span>
              <Link
                href={`/author/${authorId}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all articles by {author.name || "this author"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
