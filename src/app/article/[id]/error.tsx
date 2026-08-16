"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";

export default function ArticleError({ reset }: { error: Error; reset: () => void }) {
  const savedArticles = useAppStore((s) => s.savedArticles);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-surface">
      <div className="text-center px-6 py-16 max-w-md mx-auto">
        <div className="mx-auto w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-error">wifi_off</span>
        </div>
        <h1 className="text-2xl font-black text-on-surface mb-2">Unable to load story</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          You may be offline or the network request timed out.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-primary/90 transition-colors cursor-pointer text-sm"
          >
            Try again
          </button>
          {savedArticles.length > 0 && (
            <Link
              href="/saved"
              className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface rounded-2xl font-bold hover:bg-surface-variant transition-colors text-sm"
            >
              View Saved Stories ({savedArticles.length})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
