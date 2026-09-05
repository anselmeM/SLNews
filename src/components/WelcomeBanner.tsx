"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const WELCOME_KEY = "slnews_welcome_dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("slnews:welcome-dismissed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("slnews:welcome-dismissed", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(WELCOME_KEY) === "true";
}

function getServerSnapshot() {
  return true;
}

export default function WelcomeBanner() {
  const isDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_KEY, "true");
    window.dispatchEvent(new Event("slnews:welcome-dismissed"));
  };

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Welcome to SLNews"
      className="mb-6 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-container-high to-primary/5 border border-primary/20 p-4 sm:p-5 shadow-xs relative transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">
            travel_explore
          </span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Welcome to SLNews
              </span>
              <span className="text-xs text-on-surface-variant font-medium hidden sm:inline">
                Low Data • Real-Time • Community Driven
              </span>
            </div>
            <p className="text-sm text-on-surface font-medium leading-relaxed">
              Your home for Sierra Leone national news, daily briefings, and real-time market prices. No app store required.
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap text-xs font-bold">
              <Link
                href="/about"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn About SLNews
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <span className="text-outline-variant">•</span>
              <Link
                href="/market"
                className="text-on-surface-variant hover:text-on-surface hover:underline inline-flex items-center gap-1"
              >
                Live Market Prices
              </Link>
              <span className="text-outline-variant">•</span>
              <Link
                href="/announcements"
                className="text-on-surface-variant hover:text-on-surface hover:underline inline-flex items-center gap-1"
              >
                Notices & Announcements
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss welcome banner"
          title="Dismiss"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </aside>
  );
}
