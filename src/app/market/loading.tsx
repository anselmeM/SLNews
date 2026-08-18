import { ShimmerBar, ShimmerMarketCards } from "@/components/Shimmer";

export default function MarketLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <ShimmerBar className="h-8 w-48 rounded-lg" />
        <ShimmerBar className="h-4 w-72 rounded-md" />
      </div>

      <div className="flex gap-4 border-b border-outline-variant/20 pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBar key={i} className="h-10 w-32 rounded-t-lg" />
        ))}
      </div>

      <ShimmerMarketCards count={6} />
    </div>
  );
}