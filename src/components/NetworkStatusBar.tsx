"use client";

import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { vibrateSuccess, vibrateWarning } from "@/lib/haptics";
import { useAppStore } from "@/store/useAppStore";

export default function NetworkStatusBar() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return !navigator.onLine;
    }
    return false;
  });
  const [showReconnected, setShowReconnected] = useState(false);
  const savedCount = useAppStore((state) => state.savedArticles.length);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      vibrateSuccess();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      vibrateWarning();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-16 sm:top-18 left-0 right-0 z-40 pointer-events-none px-4 flex justify-center">
      <AnimatePresence>
        {isOffline && (
          <m.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto bg-surface-container-highest/95 border border-outline-variant/80 text-on-surface px-4 py-2.5 rounded-full shadow-xl flex items-center gap-3 text-xs font-semibold max-w-md w-full justify-between backdrop-blur-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-amber-500 shrink-0 animate-pulse">
                cloud_off
              </span>
              <span className="truncate">
                You are offline · Reading cached stories
              </span>
            </div>
            {savedCount > 0 && (
              <Link
                href="/saved"
                className="bg-primary hover:bg-primary/95 text-white font-bold px-3 py-1 rounded-full text-[11px] shrink-0 transition-colors"
              >
                Saved ({savedCount})
              </Link>
            )}
          </m.div>
        )}
        {!isOffline && showReconnected && (
          <m.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">
              cloud_done
            </span>
            <span>Back online · Live news restored</span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
