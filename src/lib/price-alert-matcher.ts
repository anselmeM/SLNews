export type PriceAlertRow = {
  id: string;
  userId: string;
  commodity: string;
  market: string;
  lastNotifiedAt: Date | null;
};

export type MarketPriceRow = {
  commodity: string;
  market: string;
  updatedAt: Date;
};

export function priceKey(commodity: string, market: string): string {
  return `${commodity.trim().toLowerCase()}|${market.trim().toLowerCase()}`;
}

export function findPriceAlertHits(
  alerts: PriceAlertRow[],
  prices: MarketPriceRow[]
): PriceAlertRow[] {
  const priceByKey = new Map<string, MarketPriceRow>();
  for (const price of prices) {
    priceByKey.set(priceKey(price.commodity, price.market), price);
  }

  return alerts.filter((alert) => {
    const price = priceByKey.get(priceKey(alert.commodity, alert.market));
    if (!price) return false;
    if (!alert.lastNotifiedAt) return true;
    return price.updatedAt.getTime() > alert.lastNotifiedAt.getTime();
  });
}
