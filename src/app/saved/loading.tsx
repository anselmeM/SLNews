import { ShimmerFeed } from "@/components/Shimmer";

export default function Loading() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mt-4 mb-2">
        <div className="h-12 w-56 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-2" />
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      </div>
      <ShimmerFeed count={3} />
    </div>
  );
}
