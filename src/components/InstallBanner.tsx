"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const alreadyInstalled = localStorage.getItem("slnews-pwa-installed");
      const alreadyDismissed = localStorage.getItem("slnews-pwa-dismissed");
      if (!alreadyInstalled && !alreadyDismissed) {
        setTimeout(() => setVisible(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("slnews-pwa-dismissed", "1");
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-32 md:bottom-16 left-4 right-4 mx-auto max-w-sm z-50 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/40 rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <span className="text-white font-black text-sm">SL</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface">Get the app</p>
        <p className="text-xs text-on-surface-variant">Install for a better experience</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        className="p-1.5 text-on-surface-variant hover:text-on-surface shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
