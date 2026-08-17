"use client";

import { useState } from "react";
import type { PriceAlertItem } from "@/app/actions/market-actions";
import BottomSheet from "@/components/BottomSheet";

const inputCls =
  "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-sm";
const labelCls = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5";

type PriceAlertsSheetProps = {
  open: boolean;
  onClose: () => void;
  alerts: PriceAlertItem[];
  commodities: string[];
  markets: string[];
  defaultCommodity: string;
  defaultMarket: string;
  busy: boolean;
  onToggleAlert: (commodity: string, market: string) => Promise<void>;
  onSubmitAlert: (commodity: string, market: string) => Promise<void>;
};

export default function PriceAlertsSheet({
  open,
  onClose,
  alerts,
  commodities,
  markets,
  defaultCommodity,
  defaultMarket,
  busy,
  onToggleAlert,
  onSubmitAlert,
}: PriceAlertsSheetProps) {
  const [alertCommodity, setAlertCommodity] = useState(defaultCommodity);
  const [alertMarket, setAlertMarket] = useState(defaultMarket);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Price Alerts</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Get notified when commodity prices move in your market.
        </p>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
            Your alerts
          </h3>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 bg-surface-container-low rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-label-md text-label-md text-on-surface truncate">{a.commodity}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{a.market}</div>
                  <div className="font-label-sm text-label-sm text-primary mt-0.5">
                    We&apos;ll ping you when this price changes
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleAlert(a.commodity, a.market)}
                  disabled={busy}
                  aria-label={`Remove alert for ${a.commodity} in ${a.market}`}
                  className="text-error flex items-center gap-1 font-label-sm text-label-sm hover:underline disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span> Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="alert-commodity" className={labelCls}>
            Commodity
          </label>
          <select
            id="alert-commodity"
            value={alertCommodity}
            onChange={(e) => setAlertCommodity(e.target.value)}
            className={inputCls}
          >
            {commodities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="alert-market" className={labelCls}>
            Market
          </label>
          <select
            id="alert-market"
            value={alertMarket}
            onChange={(e) => setAlertMarket(e.target.value)}
            className={inputCls}
          >
            {markets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onSubmitAlert(alertCommodity, alertMarket)}
          disabled={busy}
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
        >
          {busy ? "Working..." : "Set Alert"}
        </button>
      </div>
    </BottomSheet>
  );
}
