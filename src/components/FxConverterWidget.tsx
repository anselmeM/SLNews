"use client";

import { useState } from "react";
import { convertCurrency } from "@/lib/fx-service";

const CURRENCY_OPTIONS = [
  { code: "USD", name: "USD - US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "EUR - Euro", flag: "🇪🇺" },
  { code: "GBP", name: "GBP - British Pound", flag: "🇬🇧" },
  { code: "CNY", name: "CNY - Chinese Yuan", flag: "🇨🇳" },
  { code: "SLE", name: "NLe - Sierra Leone Leone", flag: "🇸🇱" },
];

export default function FxConverterWidget() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("SLE");
  const [useCommercial, setUseCommercial] = useState<boolean>(true);

  const { result, rate } = convertCurrency(amount, fromCurr, toCurr, useCommercial);

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const fromObj = CURRENCY_OPTIONS.find((c) => c.code === fromCurr) || CURRENCY_OPTIONS[0];
  const toObj = CURRENCY_OPTIONS.find((c) => c.code === toCurr) || CURRENCY_OPTIONS[4];

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">calculate</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Live Currency Converter
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Instant exchange calculation with current Sierra Leone Leone rates.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={useCommercial}
            onChange={(e) => setUseCommercial(e.target.checked)}
            className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
          Use Commercial Market Rate
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Amount & From */}
        <div className="md:col-span-5 space-y-2">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            You Pay / Convert
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="100"
              className="flex-1 px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/60 text-base font-bold text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
            <select
              value={fromCurr}
              onChange={(e) => setFromCurr(e.target.value)}
              className="px-3 py-3 rounded-2xl bg-surface-container border border-outline-variant/60 text-sm font-bold text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={`from-${c.code}`} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
          <button
            type="button"
            onClick={handleSwap}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-xs"
            title="Swap currencies"
            aria-label="Swap currencies"
          >
            <span className="material-symbols-outlined text-lg">swap_horiz</span>
          </button>
        </div>

        {/* Result & To */}
        <div className="md:col-span-5 space-y-2">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            You Receive
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/20 text-base font-black text-primary flex items-center">
              {result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <select
              value={toCurr}
              onChange={(e) => setToCurr(e.target.value)}
              className="px-3 py-3 rounded-2xl bg-surface-container border border-outline-variant/60 text-sm font-bold text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={`to-${c.code}`} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Formula Card */}
      <div className="p-4 rounded-2xl bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">{fromObj?.flag}</span>
          <span className="font-semibold text-on-surface">
            {amount} {fromCurr} =
          </span>
          <span className="text-base">{toObj?.flag}</span>
          <span className="font-bold text-primary">
            {result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurr}
          </span>
        </div>
        <span className="text-on-surface-variant font-medium">
          Rate: 1 {fromCurr} = {rate} {toCurr}
        </span>
      </div>
    </div>
  );
}
