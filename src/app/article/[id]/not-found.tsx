import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center px-6 py-16 max-w-md mx-auto">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-primary">article_off</span>
        </div>
        <h1 className="text-6xl font-black text-on-surface tracking-tighter mb-2">404</h1>
        <p className="text-lg font-semibold text-on-surface mb-1">Article not found</p>
        <p className="text-sm text-on-surface-variant mb-8">
          This article may have been removed or the link is invalid.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">newspaper</span>
          Browse News
        </Link>
      </div>
    </div>
  );
}
