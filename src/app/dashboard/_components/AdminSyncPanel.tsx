"use client";

import { useState, useTransition } from "react";
import { triggerMarketPriceSyncAction } from "@/app/actions/market-actions";
import { triggerVideoSyncAction } from "@/app/actions/reel-actions";
import { syncWorldNews } from "@/app/actions/sync-news-api";
import { syncFromScraper } from "@/app/actions/sync-scraper";

export default function AdminSyncPanel({ compact }: { compact?: boolean }) {
  const [isSyncing, startSyncTransition] = useTransition();
  const [isVideoSyncing, startVideoSyncTransition] = useTransition();
  const [isMarketSyncing, startMarketSyncTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            startSyncTransition(async () => {
              const [sl, world] = await Promise.allSettled([syncFromScraper(), syncWorldNews()]);
              const slCount = sl.status === "fulfilled" ? sl.value.count ?? 0 : 0;
              const worldCount = world.status === "fulfilled" ? world.value.count ?? 0 : 0;
              const ok = (sl.status === "fulfilled" && sl.value.success) || (world.status === "fulfilled" && world.value.success);
              if (ok) {
                setSyncResult(`Synced ${slCount + worldCount} articles`);
              } else {
                setSyncResult(`Sync failed`);
              }
            });
          }}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-surface-variant text-on-surface-variant px-3 py-2 rounded-xl font-medium text-xs hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-outline-variant min-h-[36px]"
          title="Sync news from scraper"
        >
          <span className="material-symbols-outlined text-base">sync</span>
          <span className="hidden xl:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
        </button>
        {syncResult && (
          <span className="text-xs text-primary font-medium whitespace-nowrap">{syncResult}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-5">
      <h3 className="font-semibold text-on-surface mb-1">Admin Ingestion & Refresh Tools</h3>
      <p className="text-xs text-on-surface-variant mb-4">
        Trigger live syncs for Sierra Leone news articles, YouTube video shorts, and commodity market prices.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            startSyncTransition(async () => {
              const [sl, world] = await Promise.allSettled([syncFromScraper(), syncWorldNews()]);
              const slCount = sl.status === "fulfilled" ? sl.value.count ?? 0 : 0;
              const worldCount = world.status === "fulfilled" ? world.value.count ?? 0 : 0;
              const ok = (sl.status === "fulfilled" && sl.value.success) || (world.status === "fulfilled" && world.value.success);
              if (ok) {
                setSyncResult(`Successfully synced ${slCount + worldCount} articles!`);
              } else {
                setSyncResult(`Sync failed`);
              }
            });
          }}
          disabled={isSyncing}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">newspaper</span>
          <span>{isSyncing ? "Syncing..." : "Sync News"}</span>
        </button>

        <button
          onClick={() => {
            startVideoSyncTransition(async () => {
              const res = await triggerVideoSyncAction();
              if (res.success) {
                setSyncResult(res.message);
              } else {
                setSyncResult(`Video sync failed: ${res.message}`);
              }
            });
          }}
          disabled={isVideoSyncing}
          className="bg-surface-container text-on-surface px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-outline-variant flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">videocam</span>
          <span>{isVideoSyncing ? "Syncing Videos..." : "Sync Video Reels"}</span>
        </button>

        <button
          onClick={() => {
            startMarketSyncTransition(async () => {
              const res = await triggerMarketPriceSyncAction();
              if (res.success) {
                setSyncResult(res.message);
              } else {
                setSyncResult(`Market sync failed: ${res.message}`);
              }
            });
          }}
          disabled={isMarketSyncing}
          className="bg-surface-container text-on-surface px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-outline-variant flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">storefront</span>
          <span>{isMarketSyncing ? "Syncing Prices..." : "Sync Market Prices"}</span>
        </button>

        {syncResult && <p className="text-xs text-primary font-medium w-full mt-2">{syncResult}</p>}
      </div>
    </div>
  );
}

