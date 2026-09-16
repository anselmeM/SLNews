"use client";

import Link from "next/link";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { trackCustomMetaEvent } from "@/lib/meta-pixel";

// Overridable once the Play listing goes live (Milestone 2).
const PLAY_STORE_FALLBACK = "https://play.google.com/store/apps/details?id=com.slnews.app";

/**
 * Conversion actions for the /download ad landing page. The primary action
 * uses the PWA install prompt (which fires the `AppInstallPrompt` Meta event);
 * the secondary points at the Google Play listing for the TWA build.
 */
export default function DownloadCTA() {
  const { isStandalone, isInstalled, promptInstall } = usePWAInstall();
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL || PLAY_STORE_FALLBACK;
  const installed = isStandalone || isInstalled;

  if (installed) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        <span className="inline-flex items-center gap-2 font-semibold text-on-primary">
          <span className="material-symbols-outlined">check_circle</span>
          SLNews is installed on this device
        </span>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-on-primary text-primary font-bold px-5 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Open SLNews
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
      <button
        type="button"
        onClick={() => {
          void promptInstall();
        }}
        className="inline-flex w-full sm:w-auto justify-center items-center gap-2 bg-white text-primary font-bold px-6 py-3.5 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined">install_mobile</span>
        Install the app
      </button>
      <a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCustomMetaEvent("PlayStoreClick", { placement: "download_page" })}
        className="inline-flex w-full sm:w-auto justify-center items-center gap-2 bg-primary-container/20 text-on-primary border border-on-primary/30 font-bold px-6 py-3.5 rounded-full hover:bg-primary-container/30 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined">android</span>
        Get it on Google Play
      </a>
    </div>
  );
}
