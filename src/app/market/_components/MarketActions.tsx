"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import PriceAlertsSheet from "./PriceAlertsSheet";
import PriceReportSheet from "./PriceReportSheet";
import {
  getMyPriceAlerts,
  reportPriceChange,
  togglePriceAlert,
  type PriceAlertItem,
} from "@/app/actions/market-actions";
import { useToast } from "@/components/Toast";
import { vibrate } from "@/lib/haptics";

type SheetKind = "alerts" | "report" | null;

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

  useEffect(() => {
    let cancelled = false;
    if (!session?.user) return;
    getMyPriceAlerts().then((data) => {
      if (!cancelled) setAlerts(data);
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

  const handleSubmitAlert = async (commodity: string, market: string) => {
    if (!commodity || !market) {
      toast("Select a commodity and market", "error");
      return;
    }
    setBusy(true);
    const result = await togglePriceAlert(commodity, market);
    setBusy(false);
    if (!result.success) {
      toast(result.error || "Failed to set alert", "error");
      return;
    }
    vibrate();
    toast(result.active ? "Price alert set" : "Price alert removed", result.active ? "success" : "info");
    reloadAlerts();
  };

  const handleSubmitReport = async (data: {
    commodity: string;
    market: string;
    price: number;
    notes?: string;
  }) => {
    if (!data.commodity || !data.market) {
      toast("Select a commodity and market", "error");
      return;
    }
    if (!Number.isFinite(data.price) || data.price <= 0) {
      toast("Enter a valid price", "error");
      return;
    }
    setBusy(true);
    const result = await reportPriceChange({
      commodity: data.commodity,
      market: data.market,
      reportedPrice: data.price,
      notes: data.notes,
    });
    setBusy(false);
    if (!result.success) {
      toast(result.error || "Failed to submit report", "error");
      return;
    }
    vibrate();
    toast("Price report submitted for review", "success");
    setSheet(null);
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

      <PriceAlertsSheet
        open={sheet === "alerts"}
        onClose={() => setSheet(null)}
        alerts={alerts}
        commodities={commodities}
        markets={markets}
        defaultCommodity={commodities[0] || ""}
        defaultMarket={currentMarket}
        busy={busy}
        onToggleAlert={handleToggleAlert}
        onSubmitAlert={handleSubmitAlert}
      />

      <PriceReportSheet
        open={sheet === "report"}
        onClose={() => setSheet(null)}
        commodities={commodities}
        markets={markets}
        defaultCommodity={commodities[0] || ""}
        defaultMarket={currentMarket}
        busy={busy}
        onSubmitReport={handleSubmitReport}
      />
    </>
  );
}
