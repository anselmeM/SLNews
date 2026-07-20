"use client";

import { useTransition, useState } from "react";
import { syncFromScraper } from "@/app/actions/sync-scraper";
import { syncWorldNews } from "@/app/actions/sync-news-api";

export default function AdminSyncPanel({ compact }: { compact?: boolean }) {
  const [isSyncing, startSyncTransition] = useTransition();
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
      <h3 className="font-semibold text-on-surface mb-1">Admin Ingestion Tools</h3>
      <p className="text-xs text-on-surface-variant mb-4">Pull live Sierra Leone articles from the news scraper into your database.</p>
      <div className="flex items-center gap-3">
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
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? "Syncing..." : "Sync News"}
        </button>
        {syncResult && <p className="text-xs text-primary font-medium">{syncResult}</p>}
      </div>
    </div>
  );
}
