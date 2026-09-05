"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SNOOZE_KEY = "slnews_post_read_install_dismissed_at";

export default function PostReadInstallSheet() {
  const pathname = usePathname();
  const { isInstalled, isStandalone, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const isArticlePage = pathname.startsWith("/article/");

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(SNOOZE_KEY, Date.now().toString());
    } catch {}
  }, []);

  useEffect(() => {
    if (!isArticlePage || isInstalled || isStandalone || hasTriggered) {
      return;
    }

    try {
      const snoozedAt = localStorage.getItem(SNOOZE_KEY);
      if (snoozedAt && Date.now() - parseInt(snoozedAt, 10) < SNOOZE_MS) {
        return;
      }
    } catch {}

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollProgress = window.scrollY / scrollHeight;

      if (scrollProgress >= 0.75) {
        setIsVisible(true);
        setHasTriggered(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isArticlePage, isInstalled, isStandalone, hasTriggered]);

  if (!isVisible || isInstalled || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/60 rounded-2xl shadow-2xl p-4 relative overflow-hidden">
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-tertiary to-primary" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition cursor-pointer"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <Image
              src="/icon-192x192.png"
              alt="SLNews"
              width={44}
              height={44}
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">
              Enjoying this story?
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
              Add SLNews to your home screen for instant breaking news alerts and offline reading.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-outline-variant/20">
          <button
            onClick={async () => {
              await promptInstall();
              setIsVisible(false);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Install Free App
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-xs font-medium transition cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
