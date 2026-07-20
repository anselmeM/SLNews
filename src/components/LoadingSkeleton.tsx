"use client";

import { ShimmerBar } from "./Shimmer";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 mt-8">
      <ShimmerBar className="h-10 w-64 rounded-full" />
      <ShimmerBar className="h-5 w-96 rounded-full" />
      <ShimmerBar className="mt-4 h-[340px] md:h-[400px] rounded-3xl" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-3 flex gap-4">
          <ShimmerBar className="w-28 h-28 rounded-2xl shrink-0" />
          <div className="flex-1 py-1 space-y-2">
            <ShimmerBar className="h-3 w-16 rounded-full" />
            <ShimmerBar className="h-5 w-full rounded" />
            <ShimmerBar className="h-4 w-32 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
