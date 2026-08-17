export type FxRate = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  officialBuy: number;
  officialSell: number;
  commercialBuy: number;
  commercialSell: number;
  change24hPct: number;
  history7d: number[];
  updatedAt: string;
};

export const FX_RATES: FxRate[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    officialBuy: 22.65,
    officialSell: 22.88,
    commercialBuy: 22.95,
    commercialSell: 23.25,
    change24hPct: 0.22,
    history7d: [22.5, 22.55, 22.58, 22.62, 22.7, 22.72, 22.76],
    updatedAt: new Date().toISOString(),
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    officialBuy: 24.45,
    officialSell: 24.75,
    commercialBuy: 24.8,
    commercialSell: 25.15,
    change24hPct: -0.15,
    history7d: [24.9, 24.85, 24.78, 24.7, 24.65, 24.62, 24.6],
    updatedAt: new Date().toISOString(),
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    officialBuy: 28.7,
    officialSell: 29.1,
    commercialBuy: 29.2,
    commercialSell: 29.6,
    change24hPct: 0.35,
    history7d: [28.6, 28.68, 28.75, 28.8, 28.85, 28.9, 28.95],
    updatedAt: new Date().toISOString(),
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    flag: "🇨🇳",
    officialBuy: 3.12,
    officialSell: 3.18,
    commercialBuy: 3.2,
    commercialSell: 3.28,
    change24hPct: 0.05,
    history7d: [3.1, 3.11, 3.12, 3.13, 3.14, 3.15, 3.15],
    updatedAt: new Date().toISOString(),
  },
];

export function getFxRate(code: string): FxRate | undefined {
  return FX_RATES.find((r) => r.code.toUpperCase() === code.toUpperCase());
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  useCommercial = true
): { result: number; rate: number } {
  if (amount <= 0 || isNaN(amount)) return { result: 0, rate: 1 };
  if (from.toUpperCase() === to.toUpperCase()) return { result: amount, rate: 1 };

  // Convert to NLe (SLE) base
  let amountInNle = amount;
  if (from.toUpperCase() !== "SLE" && from.toUpperCase() !== "NLE") {
    const fromRate = getFxRate(from);
    if (!fromRate) return { result: 0, rate: 1 };
    const rateVal = useCommercial ? fromRate.commercialBuy : fromRate.officialBuy;
    amountInNle = amount * rateVal;
  }

  // Convert from NLe to target
  if (to.toUpperCase() === "SLE" || to.toUpperCase() === "NLE") {
    const rate = amountInNle / amount;
    return { result: Number(amountInNle.toFixed(2)), rate };
  }

  const toRate = getFxRate(to);
  if (!toRate) return { result: 0, rate: 1 };
  const targetRateVal = useCommercial ? toRate.commercialSell : toRate.officialSell;
  const finalResult = amountInNle / targetRateVal;
  const effectiveRate = finalResult / amount;

  return {
    result: Number(finalResult.toFixed(2)),
    rate: Number(effectiveRate.toFixed(4)),
  };
}
