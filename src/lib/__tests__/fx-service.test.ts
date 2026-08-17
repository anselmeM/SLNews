import { describe, it, expect } from "vitest";
import { FX_RATES, getFxRate, convertCurrency } from "../fx-service";

describe("fx-service", () => {
  describe("FX_RATES constants", () => {
    it("contains major currencies with valid buy/sell spreads", () => {
      expect(FX_RATES.length).toBeGreaterThanOrEqual(4);
      const usd = FX_RATES.find((r) => r.code === "USD");
      expect(usd).toBeDefined();
      expect(usd!.commercialBuy).toBeGreaterThan(0);
      expect(usd!.commercialSell).toBeGreaterThanOrEqual(usd!.commercialBuy);
      expect(usd!.history7d.length).toBe(7);
    });
  });

  describe("getFxRate", () => {
    it("finds currency by code case-insensitively", () => {
      const gbp = getFxRate("gbp");
      expect(gbp).toBeDefined();
      expect(gbp?.name).toBe("British Pound");

      const eur = getFxRate("EUR");
      expect(eur).toBeDefined();
      expect(eur?.symbol).toBe("€");

      expect(getFxRate("XYZ")).toBeUndefined();
    });
  });

  describe("convertCurrency", () => {
    it("converts USD to NLe (SLE) correctly using commercial rate", () => {
      const usd = getFxRate("USD")!;
      const { result, rate } = convertCurrency(100, "USD", "SLE", true);
      expect(result).toBe(Number((100 * usd.commercialBuy).toFixed(2)));
      expect(rate).toBe(usd.commercialBuy);
    });

    it("converts NLe (SLE) to USD correctly", () => {
      const usd = getFxRate("USD")!;
      const { result } = convertCurrency(1000, "SLE", "USD", true);
      expect(result).toBe(Number((1000 / usd.commercialSell).toFixed(2)));
    });

    it("handles same currency conversion with rate 1", () => {
      const { result, rate } = convertCurrency(250, "USD", "USD");
      expect(result).toBe(250);
      expect(rate).toBe(1);
    });

    it("handles zero, negative, or invalid amounts gracefully", () => {
      expect(convertCurrency(0, "USD", "SLE")).toEqual({ result: 0, rate: 1 });
      expect(convertCurrency(-50, "USD", "SLE")).toEqual({ result: 0, rate: 1 });
      expect(convertCurrency(NaN, "USD", "SLE")).toEqual({ result: 0, rate: 1 });
    });

    it("handles unknown currency gracefully", () => {
      expect(convertCurrency(100, "UNKNOWN", "SLE")).toEqual({ result: 0, rate: 1 });
    });
  });
});
