"use client";

import { useState } from "react";
import { FX_RATES, type FxRate } from "@/lib/fx-service";

function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const padding = 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
      <polyline
        fill="none"
        stroke={isPositive ? "#008751" : "#DC2626"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function FxRatesTable() {
  const [mode, setMode] = useState<"commercial" | "official">("commercial");

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 md:p-8 shadow-sm space-y-6">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">currency_exchange</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Foreign Exchange Rates
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Exchange rates against New Leones (NLe). Updated daily from market sources and Bank of Sierra Leone.
          </p>
        </div>

        {/* Rate Type Switcher */}
        <div className="flex items-center bg-surface-container-high rounded-full p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("commercial")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === "commercial"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Market / Commercial
          </button>
          <button
            type="button"
            onClick={() => setMode("official")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === "official"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Official (BSL)
          </button>
        </div>
      </div>

      {/* Desktop / Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/60 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="pb-3 px-2">Currency</th>
              <th className="pb-3 px-3">Buying (NLe)</th>
              <th className="pb-3 px-3">Selling (NLe)</th>
              <th className="pb-3 px-3">24h Change</th>
              <th className="pb-3 px-3 text-right">7-Day Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-sm">
            {FX_RATES.map((fx: FxRate) => {
              const buy = mode === "commercial" ? fx.commercialBuy : fx.officialBuy;
              const sell = mode === "commercial" ? fx.commercialSell : fx.officialSell;
              const isUp = fx.change24hPct >= 0;

              return (
                <tr key={fx.code} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-label={fx.name}>
                        {fx.flag}
                      </span>
                      <div>
                        <p className="font-bold text-on-surface">{fx.code}</p>
                        <p className="text-xs text-on-surface-variant">{fx.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 font-semibold text-on-surface">
                    Le {buy.toFixed(2)}
                  </td>
                  <td className="py-4 px-3 font-semibold text-on-surface">
                    Le {sell.toFixed(2)}
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isUp
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isUp ? "arrow_drop_up" : "arrow_drop_down"}
                      </span>
                      {Math.abs(fx.change24hPct)}%
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="flex justify-end items-center">
                      <Sparkline data={fx.history7d} isPositive={isUp} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
