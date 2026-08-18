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
    <div className="bg-surface-container-lowest rounded-3xl p-3 flex gap-4 border border-outline-variant/30">
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

export function ShimmerMarketCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <ShimmerBar className="h-4 w-28" />
            <ShimmerBar className="h-4 w-12 rounded-full" />
          </div>
          <ShimmerBar className="h-7 w-36" />
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <ShimmerBar className="h-3 w-24" />
            <ShimmerBar className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerAnnouncements({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-5 sm:p-6 space-y-3.5"
        >
          <div className="flex items-center gap-2">
            <ShimmerBar className="h-4 w-20 rounded-full" />
            <ShimmerBar className="h-4 w-24" />
          </div>
          <ShimmerBar className="h-5 w-3/4" />
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-2/3" />
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
            <ShimmerBar className="h-3 w-28" />
            <ShimmerBar className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 space-y-2">
            <ShimmerBar className="h-3 w-16" />
            <ShimmerBar className="h-7 w-20" />
          </div>
        ))}
      </div>
      <ShimmerFeed count={3} />
    </div>
  );
}
