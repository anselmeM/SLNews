import { ShimmerAnnouncements, ShimmerBar } from "@/components/Shimmer";

export default function AnnouncementsLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <ShimmerBar className="h-8 w-56 rounded-lg" />
        <ShimmerBar className="h-4 w-80 rounded-md" />
      </div>

      <div className="flex gap-2 pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBar key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      <ShimmerAnnouncements count={4} />
    </div>
  );
}