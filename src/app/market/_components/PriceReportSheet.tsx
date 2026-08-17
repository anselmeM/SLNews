"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";

const inputCls =
  "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-sm";
const labelCls = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5";

type PriceReportSheetProps = {
  open: boolean;
  onClose: () => void;
  commodities: string[];
  markets: string[];
  defaultCommodity: string;
  defaultMarket: string;
  busy: boolean;
  onSubmitReport: (data: {
    commodity: string;
    market: string;
    price: number;
    notes?: string;
  }) => Promise<void>;
};

export default function PriceReportSheet({
  open,
  onClose,
  commodities,
  markets,
  defaultCommodity,
  defaultMarket,
  busy,
  onSubmitReport,
}: PriceReportSheetProps) {
  const [reportCommodity, setReportCommodity] = useState(defaultCommodity);
  const [reportMarket, setReportMarket] = useState(defaultMarket);
  const [reportPrice, setReportPrice] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(reportPrice);
    onSubmitReport({
      commodity: reportCommodity,
      market: reportMarket,
      price,
      notes: reportNotes.trim() || undefined,
    });
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Report Price Change</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Saw a different price at your local market? Let us know and our editors will verify it.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="report-commodity" className={labelCls}>
            Commodity
          </label>
          <select
            id="report-commodity"
            value={reportCommodity}
            onChange={(e) => setReportCommodity(e.target.value)}
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
          <label htmlFor="report-market" className={labelCls}>
            Market
          </label>
          <select
            id="report-market"
            value={reportMarket}
            onChange={(e) => setReportMarket(e.target.value)}
            className={inputCls}
          >
            {markets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="report-price" className={labelCls}>
            New price (NLe)
          </label>
          <input
            id="report-price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={reportPrice}
            onChange={(e) => setReportPrice(e.target.value)}
            placeholder="e.g. 350.00"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label htmlFor="report-notes" className={labelCls}>
            Notes (optional)
          </label>
          <textarea
            id="report-notes"
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. Seen at a roadside stall near the central market"
            className={`${inputCls} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
        >
          {busy ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </BottomSheet>
  );
}
