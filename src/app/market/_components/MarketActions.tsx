"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  getMyPriceAlerts,
  reportPriceChange,
  togglePriceAlert,
  type PriceAlertItem,
} from "@/app/actions/market-actions";
import BottomSheet from "@/components/BottomSheet";
import { useToast } from "@/components/Toast";
import { vibrate } from "@/lib/haptics";

type SheetKind = "alerts" | "report" | null;

const inputCls =
  "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-sm";
const labelCls = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5";

export default function MarketActions({
  markets,
  commodities,
  currentMarket,
}: {
  markets: string[];
  commodities: string[];
  currentMarket: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([]);
  const [busy, setBusy] = useState(false);

  const [alertCommodity, setAlertCommodity] = useState(commodities[0] || "");
  const [alertMarket, setAlertMarket] = useState(currentMarket);

  const [reportCommodity, setReportCommodity] = useState(commodities[0] || "");
  const [reportMarket, setReportMarket] = useState(currentMarket);
  const [reportPrice, setReportPrice] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!session?.user) return;
    getMyPriceAlerts().then((alerts) => {
      if (!cancelled) setAlerts(alerts);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  const reloadAlerts = useCallback(async () => {
    if (!session?.user) return;
    setAlerts(await getMyPriceAlerts());
  }, [session?.user]);

  const requireAuth = useCallback(() => {
    if (session?.user) return true;
    toast("Sign in to use market actions", "info");
    router.push(`/login?callbackUrl=${encodeURIComponent("/market")}`);
    return false;
  }, [session?.user, router, toast]);

  const openSheet = (kind: SheetKind) => {
    if (!kind) return setSheet(null);
    if (!requireAuth()) return;
    setSheet(kind);
  };

  const handleToggleAlert = async (commodity: string, market: string) => {
    setBusy(true);
    const result = await togglePriceAlert(commodity, market);
    setBusy(false);
    if (!result.success) {
      toast(result.error || "Failed to update alert", "error");
      return;
    }
    vibrate();
    toast(result.active ? "Price alert set" : "Price alert removed", result.active ? "success" : "info");
    reloadAlerts();
  };

  const handleSubmitAlert = async () => {
    if (!alertCommodity || !alertMarket) {
      toast("Select a commodity and market", "error");
      return;
    }
    setBusy(true);
    const result = await togglePriceAlert(alertCommodity, alertMarket);
    setBusy(false);
    if (!result.success) {
      toast(result.error || "Failed to set alert", "error");
      return;
    }
    vibrate();
    toast(result.active ? "Price alert set" : "Price alert removed", result.active ? "success" : "info");
    reloadAlerts();
  };

  const handleSubmitReport = async () => {
    const price = parseFloat(reportPrice);
    if (!reportCommodity || !reportMarket) {
      toast("Select a commodity and market", "error");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast("Enter a valid price", "error");
      return;
    }
    setBusy(true);
    const result = await reportPriceChange({
      commodity: reportCommodity,
      market: reportMarket,
      reportedPrice: price,
      notes: reportNotes.trim() || undefined,
    });
    setBusy(false);
    if (!result.success) {
      toast(result.error || "Failed to submit report", "error");
      return;
    }
    vibrate();
    toast("Price report submitted for review", "success");
    setSheet(null);
    setReportPrice("");
    setReportNotes("");
  };

  return (
    <>
      <section className="flex flex-col sm:flex-row gap-6 justify-center mt-10 mb-12">
        <button
          type="button"
          onClick={() => openSheet("alerts")}
          className="bg-primary text-on-primary font-label-md text-label-md px-10 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg active:scale-95 duration-150 cursor-pointer"
        >
          <span className="material-symbols-outlined">notifications</span> Set Price Alerts
        </button>
        <button
          type="button"
          onClick={() => openSheet("report")}
          className="bg-surface-container-highest text-on-surface font-label-md text-label-md px-10 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors border border-outline-variant/30 active:scale-95 duration-150 cursor-pointer"
        >
          <span className="material-symbols-outlined">report</span> Report Price Change
        </button>
      </section>

      <BottomSheet open={sheet === "alerts"} onClose={() => setSheet(null)}>
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
                    onClick={() => handleToggleAlert(a.commodity, a.market)}
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
            onClick={handleSubmitAlert}
            disabled={busy}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
          >
            {busy ? "Working..." : "Set Alert"}
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "report"} onClose={() => setSheet(null)}>
        <div className="mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Report Price Change</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Saw a different price at your local market? Let us know and our editors will verify it.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitReport();
          }}
        >
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
    </>
  );
}
