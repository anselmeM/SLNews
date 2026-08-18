"use client";

import Link from "next/link";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function LandingHeroActions() {
  const { promptInstall, isStandalone } = usePWAInstall();

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {!isStandalone && (
        <button
          type="button"
          onClick={promptInstall}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full text-base hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install Free App
        </button>
      )}

      <Link
        href="/home"
        className="inline-flex items-center gap-2 bg-surface-container-lowest text-on-surface font-semibold px-8 py-3.5 rounded-full text-base border border-outline-variant hover:border-primary hover:bg-surface-container-low transition-all active:scale-95 shadow-xs cursor-pointer"
      >
        {isStandalone ? "Open App →" : "Start Reading →"}
      </Link>
    </div>
  );
}
