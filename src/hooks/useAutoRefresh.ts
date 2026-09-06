"use client";

import { useEffect, useRef } from "react";

export function useAutoRefresh(callback: () => void, intervalMs = 5 * 60 * 1000) {
  const lastHidden = useRef(0);
  const callbackRef = useRef(callback);

  // Always keep callbackRef up to date with the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        lastHidden.current = Date.now();
      } else {
        if (lastHidden.current > 0 && Date.now() - lastHidden.current > 60_000) {
          lastHidden.current = 0;
          callbackRef.current();
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Poll while page is visible
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        callbackRef.current();
      }
    }, intervalMs);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);
}
