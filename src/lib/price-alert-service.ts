import { sendPushNotifications } from "@/app/actions/push-actions";
import { db } from "@/lib/db";
import { findPriceAlertHits } from "@/lib/price-alert-matcher";

export async function processPriceAlerts(): Promise<{ notified: number; hits: number }> {
  const [alerts, prices] = await Promise.all([
    db.priceAlert.findMany({
      select: { id: true, userId: true, commodity: true, market: true, lastNotifiedAt: true },
    }),
    db.marketPrice.findMany({
      select: { commodity: true, market: true, updatedAt: true },
    }),
  ]);

  const hits = findPriceAlertHits(alerts, prices);
  if (hits.length === 0) return { notified: 0, hits: 0 };

  const byUser = new Map<string, { commodity: string; market: string }[]>();
  for (const hit of hits) {
    const list = byUser.get(hit.userId) ?? [];
    list.push({ commodity: hit.commodity, market: hit.market });
    byUser.set(hit.userId, list);
  }

  let notified = 0;
  for (const [userId, items] of byUser) {
    const first = items[0];
    const label = first
      ? items.length > 1
        ? `${items.length} tracked prices`
        : `${first.commodity} at ${first.market}`
      : "a tracked price";
    const result = await sendPushNotifications(
      "Price Alert",
      `Price changed: ${label}. Tap to check.`,
      "/market",
      { userId }
    );
    notified += result.sent;
  }

  await db.priceAlert.updateMany({
    where: { id: { in: hits.map((h) => h.id) } },
    data: { lastNotifiedAt: new Date() },
  });

  return { notified, hits: hits.length };
}
