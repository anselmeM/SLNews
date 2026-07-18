"use client";

import { useEffect } from "react";

export default function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="w-20 h-20 bg-error-container rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-error">
          error
        </span>
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h2>
      <p className="text-on-surface-variant text-sm max-w-md mb-6">
        We couldn&apos;t load this page. Please try again or return home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/95 transition-colors shadow-sm"
        >
          Try Again
        </button>
        <a
          href="/home"
          className="px-6 py-2.5 bg-surface-variant text-on-surface-variant rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
