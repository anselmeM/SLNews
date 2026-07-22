"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function ThemeSync() {
  const theme = useAppStore((s) => s.theme);
  const hasHydrated = useSyncExternalStore(
    (onStoreChange) => useAppStore.persist.onFinishHydration(onStoreChange),
    () => useAppStore.persist.hasHydrated(),
    () => false
  );

  useEffect(() => {
    if (!hasHydrated) return;

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, [hasHydrated, theme]);

  // Also listen for system changes when in system mode
  useEffect(() => {
    if (!hasHydrated || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      document.documentElement.classList.toggle("dark", e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [hasHydrated, theme]);

  return null;
}
