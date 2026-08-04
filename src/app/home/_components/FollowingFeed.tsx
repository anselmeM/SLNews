import { auth } from "@/auth";
import NewsFeed from "@/components/NewsFeed";
import { fetchFollowingNews, type NewsArticle } from "@/lib/news-service";

export default async function FollowingFeed() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let articles: NewsArticle[] = [];
  try {
    articles = await fetchFollowingNews(session.user.id, 0, 6);
  } catch {
    articles = [];
  }
  if (articles.length === 0) return null;

  return (
    <section className="mt-10" aria-label="From people you follow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">people</span>
          From people you follow
        </h2>
      </div>
      <NewsFeed articles={articles} featured={false} emptyMessage="" />
    </section>
  );
}
