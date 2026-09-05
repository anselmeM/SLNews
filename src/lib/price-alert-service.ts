import { sendPushNotifications } from "@/app/actions/push-actions";
import { db } from "@/lib/db";
import { findPriceAlertHits } from "@/lib/price-alert-matcher";

export async function processPriceAlerts(): Promise<{ notified: number; hits: number }> {
  const [alerts, prices] = await Promise.all([
    db.priceAlert.findMany({
      select: { id: true, userId: true, commodity: true, market: true, lastNotifiedAt: true },
    }),
    db.marketPrice.findMany({
      select: { commodity: true, market: true, price: true, trend: true, trendPct: true, updatedAt: true },
    }),
  ]);

  const hits = findPriceAlertHits(alerts, prices);
  if (hits.length === 0) return { notified: 0, hits: 0 };

  const priceMap = new Map<string, { price: number; trend: string | null; trendPct: number | null }>();
  for (const p of prices) {
    priceMap.set(`${p.commodity.trim().toLowerCase()}|${p.market.trim().toLowerCase()}`, {
      price: p.price,
      trend: p.trend,
      trendPct: p.trendPct,
    });
  }

  const byUser = new Map<string, { commodity: string; market: string; price?: number; trend?: string | null }[]>();
  for (const hit of hits) {
    const list = byUser.get(hit.userId) ?? [];
    const priceInfo = priceMap.get(`${hit.commodity.trim().toLowerCase()}|${hit.market.trim().toLowerCase()}`);
    list.push({
      commodity: hit.commodity,
      market: hit.market,
      price: priceInfo?.price,
      trend: priceInfo?.trend,
    });
    byUser.set(hit.userId, list);
  }

  let notified = 0;
  for (const [userId, items] of byUser) {
    const first = items[0];
    let bodyText = "Price updated. Tap to check.";
    if (first && first.price !== undefined) {
      bodyText = `${first.commodity} is now Le ${first.price.toLocaleString()} at ${first.market}.`;
      if (items.length > 1) {
        bodyText += ` (+${items.length - 1} other tracked items updated)`;
      }
    } else if (first) {
      bodyText = items.length > 1
        ? `${items.length} tracked commodity prices updated. Tap to check.`
        : `${first.commodity} price updated at ${first.market}.`;
    }

    const marketUrl = first
      ? `/market?commodity=${encodeURIComponent(first.commodity)}&market=${encodeURIComponent(first.market)}`
      : "/market";

    const result = await sendPushNotifications(
      "📊 Market Price Alert",
      bodyText,
      marketUrl,
      {
        userId,
        tag: `slnews-price-alert-${first ? first.commodity.toLowerCase() : "general"}`,
        actions: [{ action: "open", title: "View Market" }],
      }
    );
    notified += result.sent;
  }

  await db.priceAlert.updateMany({
    where: { id: { in: hits.map((h) => h.id) } },
    data: { lastNotifiedAt: new Date() },
  });

  return { notified, hits: hits.length };
}
