"use client";

export function ShimmerBar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function ShimmerCard() {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-3 flex gap-4">
      <ShimmerBar className="w-28 h-28 shrink-0 rounded-2xl" />
      <div className="flex-1 py-1 space-y-3">
        <ShimmerBar className="h-3 w-20" />
        <ShimmerBar className="h-4 w-full" />
        <ShimmerBar className="h-4 w-3/4" />
        <ShimmerBar className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ShimmerFeed({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
  );
}
