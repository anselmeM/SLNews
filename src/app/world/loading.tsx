import { ShimmerFeed } from "@/components/Shimmer";

export default function Loading() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 mt-4">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-2" />
        <div className="h-5 w-72 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      </div>
      <ShimmerFeed count={4} />
    </div>
  );
}
