"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function ThemeSync() {
  const theme = useAppStore((s) => s.theme);
  // `persist` may be undefined if storage is unavailable (blocked/private mode)
  // — guard so ThemeSync can never throw during render.
  const hasHydrated = useSyncExternalStore(
    (onStoreChange) => {
      if (!useAppStore.persist) return () => {};
      return useAppStore.persist.onFinishHydration(onStoreChange);
    },
    () => useAppStore.persist?.hasHydrated() ?? false,
    () => false
  );

  // The store is created with skipHydration so SSR and the first client paint
  // agree; rehydrate on mount now that the reader shell (which used to do it)
  // is gone.
  useEffect(() => {
    useAppStore.persist?.rehydrate();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, [hasHydrated, theme]);

  // Also listen for system changes when in system mode
  useEffect(() => {
    if (
      !hasHydrated ||
      theme !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      document.documentElement.classList.toggle("dark", e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [hasHydrated, theme]);

  return null;
}
