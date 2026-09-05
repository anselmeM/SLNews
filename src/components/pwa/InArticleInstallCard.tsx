"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const subscribeNoop = () => () => {};

export default function InArticleInstallCard() {
  const { isInstalled, isStandalone, promptInstall } = usePWAInstall();
  const [userDismissed, setUserDismissed] = useState(false);

  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const isStoredDismissed = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      return () => window.removeEventListener("storage", notify);
    },
    () => {
      try {
        return !!localStorage.getItem("slnews_in_article_install_dismissed");
      } catch {
        return false;
      }
    },
    () => false
  );

  if (!isClient || isInstalled || isStandalone || userDismissed || isStoredDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setUserDismissed(true);
    try {
      localStorage.setItem("slnews_in_article_install_dismissed", "true");
    } catch {}
  };

  return (
    <aside
      aria-label="Install SLNews App"
      className="my-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container-high to-surface-container border border-primary/20 p-5 shadow-sm"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="relative w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md overflow-hidden">
            <Image
              src="/icon-192x192.png"
              alt="SLNews"
              width={48}
              height={48}
              className="object-cover"
              unoptimized
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Data Saver
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Uses 70% less data
              </span>
            </div>
            <h3 className="text-base font-bold text-on-surface mt-1">
              Read faster with the SLNews App
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Zero storage footprint • Instant breaking alerts • Offline reading
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => promptInstall()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-2.5 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 text-xs font-medium transition cursor-pointer"
            aria-label="Dismiss install suggestion"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
