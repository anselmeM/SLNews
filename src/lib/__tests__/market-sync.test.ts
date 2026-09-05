import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncMarketPrices, SIERRA_LEONE_MARKET_COMMODITIES } from "../market-sync-service";
import { invalidate } from "@/lib/cache";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    marketPrice: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/cache", () => ({
  invalidate: vi.fn(),
}));

vi.mock("@/lib/price-alert-service", () => ({
  processPriceAlerts: vi.fn().mockResolvedValue({ notified: 0, hits: 0 }),
}));

describe("Market Price Sync Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("synchronizes all Sierra Leone market commodities and invalidates cache", async () => {
    vi.mocked(db.marketPrice.upsert).mockResolvedValue({
      id: "mp-1",
      commodity: "Rice (50kg)",
      market: "Freetown Central",
      price: 180,
      trend: "up",
      trendPct: 2.5,
      trendPeriod: "this month",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await syncMarketPrices();

    expect(result.success).toBe(true);
    expect(result.count).toBe(SIERRA_LEONE_MARKET_COMMODITIES.length);
    expect(db.marketPrice.upsert).toHaveBeenCalledTimes(SIERRA_LEONE_MARKET_COMMODITIES.length);
    expect(invalidate).toHaveBeenCalledWith("market:");
  });

  it("handles database upsert failures gracefully", async () => {
    vi.mocked(db.marketPrice.upsert).mockRejectedValueOnce(new Error("Database connection lost"));

    const result = await syncMarketPrices();

    expect(result.success).toBe(false);
    expect(result.count).toBe(0);
    expect(result.error).toContain("Database connection lost");
  });
});
