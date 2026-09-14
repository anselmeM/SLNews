"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : false;
}

function getServerSnapshot() {
  return false;
}

export default function OfflinePage() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot);
  const savedArticles = useAppStore((state) => state.savedArticles);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6">
        <span className="material-symbols-outlined text-4xl">
          {isOnline ? "wifi" : "wifi_off"}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight mb-2">
        {isOnline ? "Back Online!" : "You're Offline"}
      </h1>

      <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-8">
        {isOnline
          ? "Your internet connection has been restored. Tap below to reload the latest Sierra Leone headlines."
          : "It looks like your mobile connection is unavailable right now. You can still read articles you saved for offline reading."}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <button
          onClick={handleRetry}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/95 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          {isOnline ? "Reload Latest News" : "Check Connection"}
        </button>

        <Link
          href="/saved"
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-surface-container border border-outline-variant/60 text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">bookmark</span>
          View Saved Articles ({savedArticles.length})
        </Link>
      </div>

      {savedArticles.length > 0 ? (
        <div className="text-left border-t border-outline-variant/20 pt-8">
          <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              offline_pin
            </span>
            Available Offline ({savedArticles.length})
          </h2>

          <div className="divide-y divide-outline-variant/10 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden">
            {savedArticles.slice(0, 5).map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="block p-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {article.category || "National"}
                  </span>
                  {article.location && (
                    <span className="text-[10px] text-on-surface-variant">
                      • {article.location}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-on-surface line-clamp-2">
                  {article.title}
                </h3>
              </Link>
            ))}
          </div>

          {savedArticles.length > 5 && (
            <div className="mt-4 text-center">
              <Link
                href="/saved"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all {savedArticles.length} saved articles →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">
              tips_and_updates
            </span>
            <div>
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Data-Saving Tip
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                When you are on Wi-Fi or have strong data, tap the <strong>bookmark icon</strong> on any story to save it. You can read all your saved stories anytime even with zero data!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
