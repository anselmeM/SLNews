import type { Metadata } from "next";
import Link from "next/link";
import PriceReportPanel from "../_components/PriceReportPanel";
import { auth } from "@/auth";
import { getPendingPriceReports } from "@/app/actions/market-actions";

export const metadata: Metadata = {
  title: "Price Reports | SLNews",
  description: "Review community-submitted market price reports.",
};

export default async function PriceReportsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-8 text-center">
        <p className="text-on-surface">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>{" "}
          to review price reports.
        </p>
      </div>
    );
  }

  if (session.user.role !== "EDITOR" && session.user.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-on-surface">
        <h1 className="font-headline-md text-headline-md mb-4">Access Denied</h1>
        <p>You do not have permission to view price reports.</p>
      </div>
    );
  }

  const reports = await getPendingPriceReports();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-1">Price Reports</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Community-submitted price changes awaiting verification. Approving one updates the
          live market price.
        </p>
      </div>
      <PriceReportPanel initialReports={reports} />
    </div>
  );
}
