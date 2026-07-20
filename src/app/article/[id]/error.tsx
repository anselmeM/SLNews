"use client";

export default function ArticleError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-surface">
      <div className="text-center px-6 py-16 max-w-md mx-auto">
        <div className="mx-auto w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
        </div>
        <h1 className="text-2xl font-black text-on-surface mb-2">Failed to load article</h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Something went wrong while loading this article. This might be temporary.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
