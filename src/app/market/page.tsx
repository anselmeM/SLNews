import type { Metadata } from "next";
import Link from "next/link";
import ComingSoonButton from "@/components/ComingSoonButton";
import CommodityCard from "@/components/CommodityCard";
import { cachedFetch } from "@/lib/cache";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Market Prices | SLNews",
  description: "Current market prices for rice, petrol, palm oil, cement, and more across Sierra Leone.",
};

const MARKETS = ["Freetown Central", "Bo Market", "Makeni Hub", "Kenema"];

export default async function MarketPricesPage(props: { searchParams: Promise<{ market?: string }> }) {
  const { market } = await props.searchParams;
  const currentMarket = market || "Freetown Central";

  const prices = await cachedFetch(`market:prices:${currentMarket}`, async () =>
    db.marketPrice.findMany({ where: { market: currentMarket }, orderBy: { commodity: "asc" } })
  , 300);

  const regionalRice = await cachedFetch("market:regional-rice", async () =>
    db.marketPrice.findMany({ where: { commodity: "Rice" }, orderBy: { market: "asc" } })
  , 300);

  const lastUpdated = prices.length > 0
    ? new Date(Math.max(...prices.map((p) => p.updatedAt.getTime())))
    : new Date();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary font-black tracking-tighter">
          Market Prices
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Track essential commodity prices across Sierra Leone.
        </p>
      </div>

      <section className="mb-8">
        <div className="flex overflow-x-auto pb-4 gap-4 border-b border-outline-variant/20" role="tablist">
          {MARKETS.map((m) => {
            const isActive = currentMarket === m;
            const href = m === "Freetown Central" ? "/market" : `/market?market=${encodeURIComponent(m)}`;
            return (
              <Link
                key={m}
                href={href}
                role="tab"
                aria-selected={isActive}
                className={`px-6 py-3 rounded-t-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container border-b-2 border-primary font-label-md text-label-md"
                    : "text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high"
                }`}
              >
                {m}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-4 text-on-surface-variant">
          <span className="font-label-sm text-label-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">update</span>{" "}
            Last updated: {lastUpdated.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
          <ComingSoonButton message="Price alerts coming soon!" className="font-label-sm text-label-sm text-primary flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-[16px]">notifications_active</span> Set Alert
          </ComingSoonButton>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {prices.map((p) => (
          <CommodityCard key={p.id} price={p} />
        ))}
        {prices.length === 0 && (
          <div className="col-span-full text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
            <p className="font-semibold text-sm">No price data for {currentMarket}.</p>
          </div>
        )}
      </section>

      <section className="mb-12 bg-surface-container border border-outline-variant/20 rounded-xl p-6 md:p-10">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Regional Staple Comparison</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Comparing 50kg Imported Rice across major provincial hubs.</p>
        <div className="space-y-4">
          {regionalRice.map((rp) => {
            const colors: Record<string, string> = {
              "Freetown Central": "text-primary",
              "Bo Market": "text-secondary",
              "Makeni Hub": "text-tertiary",
              "Kenema": "text-outline",
            };
            const iconMap: Record<string, string> = {
              "Freetown Central": "location_city",
              "Bo Market": "map",
              "Makeni Hub": "terrain",
              "Kenema": "forest",
            };
            return (
              <div key={rp.id} className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${colors[rp.market] || "text-primary"}`}>{iconMap[rp.market] || "location_city"}</span>
                  <span className="font-label-md text-label-md text-on-surface">{rp.market.replace(" Hub", "")}</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface">Le {rp.price}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-6 justify-center mt-10 mb-12">
        <ComingSoonButton message="Price alerts coming soon!" className="bg-primary text-on-primary font-label-md text-label-md px-10 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-lg active:scale-95 duration-150">
          <span className="material-symbols-outlined">notifications</span> Set Price Alerts
        </ComingSoonButton>
        <ComingSoonButton message="Price report form coming soon!" className="bg-surface-container-highest text-on-surface font-label-md text-label-md px-10 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors border border-outline-variant/30 active:scale-95 duration-150">
          <span className="material-symbols-outlined">report</span> Report Price Change
        </ComingSoonButton>
      </section>
    </div>
  );
}
