import { ShimmerBar } from "@/components/Shimmer";

export default function Loading() {
  return (
    <div className="max-w-[720px] mx-auto pt-4">
      <ShimmerBar className="w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl mb-6" />
      <ShimmerBar className="h-4 w-32 rounded-full mb-3" />
      <ShimmerBar className="h-10 w-3/4 rounded mb-2" />
      <ShimmerBar className="h-10 w-1/2 rounded mb-6" />
      <ShimmerBar className="h-3 w-48 rounded mb-8" />
      <div className="space-y-4">
        <ShimmerBar className="h-4 w-full rounded" />
        <ShimmerBar className="h-4 w-full rounded" />
        <ShimmerBar className="h-4 w-3/4 rounded" />
        <ShimmerBar className="h-4 w-full rounded" />
        <ShimmerBar className="h-4 w-5/6 rounded" />
        <ShimmerBar className="h-4 w-full rounded" />
        <ShimmerBar className="h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
