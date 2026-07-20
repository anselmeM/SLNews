import { ShimmerBar } from "@/components/Shimmer";

export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant">
          <div className="flex flex-col items-center gap-3">
            <ShimmerBar className="w-16 h-16 rounded-full" />
            <ShimmerBar className="h-5 w-32 rounded" />
            <ShimmerBar className="h-4 w-24 rounded" />
          </div>
        </div>
        <ShimmerBar className="h-12 w-full rounded-xl" />
        <ShimmerBar className="h-12 w-full rounded-xl" />
        <ShimmerBar className="h-12 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-8">
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant space-y-4">
          <ShimmerBar className="h-6 w-40 rounded" />
          <ShimmerBar className="h-12 w-full rounded" />
          <ShimmerBar className="h-12 w-full rounded" />
          <ShimmerBar className="h-12 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
