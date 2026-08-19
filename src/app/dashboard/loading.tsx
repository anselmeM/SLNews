import { ShimmerBar, ShimmerDashboard } from "@/components/Shimmer";

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerBar className="h-8 w-48 rounded-lg" />
          <ShimmerBar className="h-4 w-72 rounded-md" />
        </div>
        <ShimmerBar className="h-10 w-32 rounded-full" />
      </div>

      <ShimmerDashboard />
    </div>
  );
}