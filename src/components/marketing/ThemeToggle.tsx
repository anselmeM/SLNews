"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Light/dark toggle for the marketing pages.
 *
 * The resolved state is kept in React state (never read from the DOM during
 * render, so SSR and hydration agree) and the class is applied in an effect.
 * The choice persists through the same store the app uses.
 */
export default function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () =>
      theme === "dark" || (theme === "system" && media.matches);
    const apply = () => {
      const dark = resolve();
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:text-on-surface"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
