"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { reviewPriceReport, type PriceReportItem } from "@/app/actions/market-actions";
import { useToast } from "@/components/Toast";
import { vibrate } from "@/lib/haptics";

export default function PriceReportPanel({
  initialReports,
}: {
  initialReports: PriceReportItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState(initialReports);
  const [busyId, setBusyId] = useState<string | null>(null);

  const review = async (report: PriceReportItem, decision: "APPROVED" | "REJECTED") => {
    setBusyId(report.id);
    const result = await reviewPriceReport(report.id, decision);
    setBusyId(null);
    if (!result.success) {
      toast(result.error || "Failed to update report", "error");
      return;
    }
    vibrate();
    toast(
      decision === "APPROVED" ? "Price updated" : "Report rejected",
      decision === "APPROVED" ? "success" : "info"
    );
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    router.refresh();
  };

  if (reports.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-10 text-center">
        <span className="material-symbols-outlined text-5xl mb-3 text-on-surface-variant">
          verified
        </span>
        <p className="font-semibold text-on-surface">No pending reports</p>
        <p className="text-sm text-on-surface-variant mt-1">
          New submissions from the market page will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li
          key={report.id}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">
                {report.commodity} — {report.market}
              </p>
              <p className="font-headline-sm text-headline-sm text-primary mt-1">
                Le {report.reportedPrice}
              </p>
            </div>
            <span className="text-xs text-on-surface-variant shrink-0">
              {report.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Reported by {report.reporterName || "SLNews user"}
          </p>
          {report.notes && (
            <p className="font-body-sm text-body-sm text-on-surface mt-1 bg-surface-container rounded-xl px-3 py-2">
              {report.notes}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => review(report, "APPROVED")}
              disabled={busyId === report.id}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-lg">check</span> Approve
            </button>
            <button
              type="button"
              onClick={() => review(report, "REJECTED")}
              disabled={busyId === report.id}
              className="flex-1 py-2.5 px-4 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 border border-outline-variant/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-lg">close</span> Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
