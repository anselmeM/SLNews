"use client";

import { useEffect, useRef } from "react";

export function useAutoRefresh(callback: () => void, intervalMs = 5 * 60 * 1000) {
  const lastHidden = useRef(0);

  useEffect(() => {
    function onVisible() {
      if (Date.now() - lastHidden.current > 60_000) {
        callback();
      }
    }

    function onHidden() {
      lastHidden.current = Date.now();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) onHidden();
      else onVisible();
    });

    // Poll while visible
    const timer = setInterval(() => {
      if (!document.hidden) callback();
    }, intervalMs);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [callback, intervalMs]);
}
