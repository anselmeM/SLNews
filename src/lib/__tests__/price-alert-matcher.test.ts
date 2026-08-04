import { describe, expect, it } from "vitest";
import {
  findPriceAlertHits,
  priceKey,
  type MarketPriceRow,
  type PriceAlertRow,
} from "@/lib/price-alert-matcher";

function makeAlert(overrides: Partial<PriceAlertRow> = {}): PriceAlertRow {
  return {
    id: "alert-1",
    userId: "user-1",
    commodity: "Rice",
    market: "Freetown Central",
    lastNotifiedAt: null,
    ...overrides,
  };
}

function makePrice(overrides: Partial<MarketPriceRow> = {}): MarketPriceRow {
  return {
    commodity: "Rice",
    market: "Freetown Central",
    updatedAt: new Date("2026-07-01T12:00:00Z"),
    ...overrides,
  };
}

describe("priceKey", () => {
  it("normalizes case and trims whitespace", () => {
    expect(priceKey("  Rice ", "Freetown Central")).toBe(
      priceKey("rice", "freetown central")
    );
  });
});

describe("findPriceAlertHits", () => {
  it("hits alerts with no lastNotifiedAt", () => {
    const result = findPriceAlertHits([makeAlert()], [makePrice()]);
    expect(result).toHaveLength(1);
  });

  it("hits alerts whose price changed after lastNotifiedAt", () => {
    const alert = makeAlert({
      lastNotifiedAt: new Date("2026-07-01T10:00:00Z"),
    });
    const price = makePrice({ updatedAt: new Date("2026-07-01T12:00:00Z") });
    expect(findPriceAlertHits([alert], [price])).toHaveLength(1);
  });

  it("skips alerts whose price has not changed since lastNotifiedAt", () => {
    const alert = makeAlert({
      lastNotifiedAt: new Date("2026-07-01T12:00:00Z"),
    });
    const price = makePrice({ updatedAt: new Date("2026-07-01T11:00:00Z") });
    expect(findPriceAlertHits([alert], [price])).toHaveLength(0);
  });

  it("skips alerts with no matching price row", () => {
    const alert = makeAlert({ market: "Bo Town" });
    expect(findPriceAlertHits([alert], [makePrice()])).toHaveLength(0);
  });

  it("matches ignoring case differences", () => {
    const alert = makeAlert({ commodity: "rice", market: "freetown central" });
    expect(findPriceAlertHits([alert], [makePrice()])).toHaveLength(1);
  });
});
