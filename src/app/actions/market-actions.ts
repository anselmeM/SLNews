"use server";

import { auth } from "@/auth";
import { invalidate } from "@/lib/cache";
import { db } from "@/lib/db";
import { checkDbRateLimit } from "@/lib/rate-limiter";

export type PriceAlertItem = {
  id: string;
  commodity: string;
  market: string;
};

export async function getMyPriceAlerts(): Promise<PriceAlertItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const alerts = await db.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, commodity: true, market: true },
  });

  return alerts;
}

export async function togglePriceAlert(commodity: string, market: string): Promise<{ success: boolean; active: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, active: false, error: "You must be signed in to set price alerts." };

  if (!commodity || !market) return { success: false, active: false, error: "Commodity and market are required." };

  try {
    const existing = await db.priceAlert.findUnique({
      where: { userId_commodity_market: { userId: session.user.id, commodity, market } },
    });

    if (existing) {
      await db.priceAlert.delete({ where: { id: existing.id } });
      return { success: true, active: false };
    }

    await db.priceAlert.create({
      data: { userId: session.user.id, commodity, market },
    });
    return { success: true, active: true };
  } catch {
    return { success: false, active: false, error: "Failed to update price alert. Please try again." };
  }
}

export async function reportPriceChange(input: {
  commodity: string;
  market: string;
  reportedPrice: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in to report a price change." };

  const { commodity, market, reportedPrice, notes } = input;

  if (!commodity || !market) return { success: false, error: "Commodity and market are required." };
  if (!Number.isFinite(reportedPrice) || reportedPrice <= 0) return { success: false, error: "Please enter a valid price." };
  if (notes && notes.length > 500) return { success: false, error: "Notes are too long (max 500 characters)." };

  const rate = await checkDbRateLimit(`price-report:${session.user.id}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) {
    return { success: false, error: "Too many price reports. Please try again later." };
  }

  try {
    await db.priceReport.create({
      data: {
        userId: session.user.id,
        commodity,
        market,
        reportedPrice,
        notes: notes?.trim() || null,
        status: "PENDING",
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to submit price report. Please try again." };
  }
}

export type PriceReportItem = {
  id: string;
  commodity: string;
  market: string;
  reportedPrice: number;
  notes: string | null;
  createdAt: Date;
  reporterName: string | null;
};

export async function getPendingPriceReports(): Promise<PriceReportItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (session.user.role !== "EDITOR" && session.user.role !== "ADMIN") return [];

  const reports = await db.priceReport.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      commodity: true,
      market: true,
      reportedPrice: true,
      notes: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return reports.map((r) => ({
    id: r.id,
    commodity: r.commodity,
    market: r.market,
    reportedPrice: r.reportedPrice,
    notes: r.notes,
    createdAt: r.createdAt,
    reporterName: r.user.name,
  }));
}

export async function reviewPriceReport(
  reportId: string,
  decision: "APPROVED" | "REJECTED"
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };
  if (session.user.role !== "EDITOR" && session.user.role !== "ADMIN") {
    return { success: false, error: "You do not have permission to review price reports." };
  }

  const rate = await checkDbRateLimit(`price-review:${session.user.id}`, {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.allowed) {
    return { success: false, error: "Too many review actions. Please try again later." };
  }

  try {
    const report = await db.priceReport.findUnique({ where: { id: reportId } });
    if (!report) return { success: false, error: "Report not found." };
    if (report.status !== "PENDING") {
      return { success: false, error: "This report has already been reviewed." };
    }

    if (decision === "REJECTED") {
      await db.priceReport.update({ where: { id: reportId }, data: { status: "REJECTED" } });
      return { success: true };
    }

    const current = await db.marketPrice.findUnique({
      where: { commodity_market: { commodity: report.commodity, market: report.market } },
    });

    let trend: string | null = null;
    let trendPct: number | null = null;
    if (current) {
      if (Math.abs(current.price - report.reportedPrice) < 0.001) {
        trend = "stable";
        trendPct = 0;
      } else {
        trend = report.reportedPrice > current.price ? "up" : "down";
        trendPct = Number(
          (((report.reportedPrice - current.price) / current.price) * 100).toFixed(2)
        );
      }
    }

    await db.$transaction([
      db.marketPrice.upsert({
        where: {
          commodity_market: { commodity: report.commodity, market: report.market },
        },
        update: { price: report.reportedPrice, trend, trendPct },
        create: {
          commodity: report.commodity,
          market: report.market,
          price: report.reportedPrice,
          trend,
          trendPct,
        },
      }),
      db.priceReport.update({ where: { id: reportId }, data: { status: "APPROVED" } }),
    ]);
    invalidate("market:");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to review price report. Please try again." };
  }
}
