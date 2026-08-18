"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const DISMISS_SNOOZE_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function InstallBanner() {
  const {
    isStandalone,
    setDeferredPrompt,
    setIsStandalone,
    setIsIOS,
    setIsAndroid,
    promptInstall,
  } = usePWAInstall();

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect OS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/i.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    if (standalone) return;

    // Check 24-hour snooze
    const lastDismissed = localStorage.getItem("slnews-pwa-dismissed-time");
    if (lastDismissed) {
      const diff = Date.now() - parseInt(lastDismissed, 10);
      if (diff < DISMISS_SNOOZE_MS) return;
    }

    // Capture Chromium beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as Parameters<typeof setDeferredPrompt>[0]);
      setTimeout(() => setVisible(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS / mobile devices without beforeinstallprompt, show the banner politely
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [setDeferredPrompt, setIsStandalone, setIsIOS, setIsAndroid]);

  const handleInstall = useCallback(async () => {
    setVisible(false);
    await promptInstall();
  }, [promptInstall]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("slnews-pwa-dismissed-time", Date.now().toString());
    }
  }, []);

  if (!visible || dismissed || isStandalone) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 right-4 mx-auto max-w-md z-50 bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
        <Image
          src="/icon-192x192.png"
          alt="SLNews Icon"
          width={48}
          height={48}
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-black text-on-surface">Download SLNews</p>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary">
            Free
          </span>
        </div>
        <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
          Read offline, instant alerts & faster loading.
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/95 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
