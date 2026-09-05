import { NextResponse } from "next/server";
import { sendPushNotifications } from "@/app/actions/push-actions";
import { syncWorldNews } from "@/app/actions/sync-news-api";
import { syncFromScraper } from "@/app/actions/sync-scraper";
import { sendMorningBriefing } from "@/lib/briefing-service";
import { syncMarketPrices } from "@/lib/market-sync-service";
import { processPriceAlerts } from "@/lib/price-alert-service";

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

  const [sl, world, market, priceAlerts, briefing] = await Promise.allSettled([
    syncFromScraper(),
    syncWorldNews(),
    syncMarketPrices(),
    processPriceAlerts(),
    sendMorningBriefing(),
  ]);

  const slResult =
    sl.status === "fulfilled" ? sl.value : { success: false, error: "rejected", count: 0 };
  const worldResult =
    world.status === "fulfilled" ? world.value : { success: false, error: "rejected", count: 0 };
  const marketResult =
    market.status === "fulfilled" ? market.value : { success: false, error: "rejected", count: 0 };
  const priceAlertResult =
    priceAlerts.status === "fulfilled"
      ? priceAlerts.value
      : { notified: 0, hits: 0, error: "rejected" };
  const briefingResult =
    briefing.status === "fulfilled"
      ? briefing.value
      : { sent: 0, error: "rejected" };

  const total = (slResult.count ?? 0) + (worldResult.count ?? 0);
  const ok = slResult.success || worldResult.success || marketResult.success;

  let pushResult = { sent: 0 };
  if (total > 0) {
    pushResult = await sendPushNotifications(
      "Breaking News",
      `${total} new article${total > 1 ? "s" : ""} on SLNews. Tap to read.`,
      "/"
    );
  }

  return NextResponse.json({
    success: ok,
    sierraLeone: slResult,
    world: worldResult,
    marketPrices: marketResult,
    priceAlerts: priceAlertResult,
    briefing: briefingResult,
    count: total,
    push: pushResult,
  });
}

