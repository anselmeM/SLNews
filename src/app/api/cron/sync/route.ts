import { NextResponse } from "next/server";
import { syncFromScraper } from "@/app/actions/sync-scraper";
import { syncWorldNews } from "@/app/actions/sync-news-api";

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

  const [sl, world] = await Promise.allSettled([
    syncFromScraper(),
    syncWorldNews(),
  ]);

  const slResult =
    sl.status === "fulfilled" ? sl.value : { success: false, error: "rejected", count: 0 };
  const worldResult =
    world.status === "fulfilled" ? world.value : { success: false, error: "rejected", count: 0 };

  const total = (slResult.count ?? 0) + (worldResult.count ?? 0);
  const ok = slResult.success || worldResult.success;

  return NextResponse.json({
    success: ok,
    sierraLeone: slResult,
    world: worldResult,
    count: total,
  });
}

