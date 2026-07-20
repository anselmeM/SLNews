import { NextResponse } from "next/server";
import { syncNewsAPI } from "@/app/actions/sync-news-api";
import { syncFromScraper } from "@/app/actions/sync-scraper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  const isValid =
    querySecret === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currents, scraper] = await Promise.allSettled([
    syncNewsAPI(),
    syncFromScraper(),
  ]);

  const currentsResult =
    currents.status === "fulfilled" ? currents.value : { success: false, error: "rejected", count: 0 };
  const scraperResult =
    scraper.status === "fulfilled" ? scraper.value : { success: false, error: "rejected", count: 0 };

  const total = (currentsResult.count ?? 0) + (scraperResult.count ?? 0);
  const ok = currentsResult.success || scraperResult.success;

  return NextResponse.json({
    success: ok,
    currents: currentsResult,
    scraper: scraperResult,
    count: total,
  });
}

