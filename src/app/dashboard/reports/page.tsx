import type { Metadata } from "next";
import Link from "next/link";
import PriceReportPanel from "../_components/PriceReportPanel";
import ReelModerationPanel from "../_components/ReelModerationPanel";
import { getPendingPriceReports } from "@/app/actions/market-actions";
import { getPendingCommunityReels } from "@/app/actions/reel-actions";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Review & Moderation | SLNews",
  description: "Review community video reels and market price reports.",
};

export default async function ModerationReportsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-8 text-center">
        <p className="text-on-surface">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>{" "}
          to review submissions.
        </p>
      </div>
    );
  }

  if (session.user.role !== "EDITOR" && session.user.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-on-surface">
        <h1 className="font-headline-md text-headline-md mb-4">Access Denied</h1>
        <p>You do not have permission to view this review queue.</p>
      </div>
    );
  }

  const [priceReports, pendingReels] = await Promise.all([
    getPendingPriceReports(),
    getPendingCommunityReels(),
  ]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/dashboard"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Dashboard</span>
          </Link>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Review & Moderation
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Moderate community video submissions and market price reports before they go live.
        </p>
      </div>

      {/* Community Video Shorts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">movie</span>
            <h2 className="text-lg font-bold text-on-surface">
              Pending Community Video Reels ({pendingReels.length})
            </h2>
          </div>
        </div>
        <ReelModerationPanel initialReels={pendingReels} />
      </section>

      {/* Market Price Reports Section */}
      <section className="space-y-4 pt-6 border-t border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
          <h2 className="text-lg font-bold text-on-surface">
            Commodity Price Reports ({priceReports.length})
          </h2>
        </div>
        <PriceReportPanel initialReports={priceReports} />
      </section>
    </div>
  );
}
