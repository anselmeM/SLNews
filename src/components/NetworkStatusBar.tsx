"use client";

import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NetworkStatusBar() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOffline(!navigator.onLine);

    let reconnectTimer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
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
    <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none px-4 flex justify-center">
      <AnimatePresence>
        {isOffline && (
          <m.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto bg-surface-container-highest border border-outline-variant text-on-surface px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-semibold max-w-md w-full justify-between backdrop-blur-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-error">wifi_off</span>
              <span className="truncate">You are offline (reading cached content)</span>
            </div>
            <Link
              href="/saved"
              className="text-primary font-bold hover:underline shrink-0 pl-2"
            >
              Saved Stories
            </Link>
          </m.div>
        )}
        {!isOffline && showReconnected && (
          <m.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto bg-primary text-on-primary px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">wifi</span>
            <span>Back online</span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
