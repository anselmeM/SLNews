"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { vibrateLight } from "@/lib/haptics";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: "home" },
  { name: "National News", href: "/local-news", icon: "map" },
  { name: "World", href: "/world", icon: "public" },
  { name: "Shorts", href: "/reels", icon: "movie" },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset visibility synchronously when route changes (official React pattern)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setVisible(true);
  }

  useEffect(() => {
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScroll = (e?: Event) => {
      const target = e?.target;
      let currentScrollY = window.scrollY || document.documentElement?.scrollTop || 0;
      if (target instanceof HTMLElement && target !== document.body && target !== document.documentElement) {
        currentScrollY = target.scrollTop;
      }

      const diff = currentScrollY - lastScrollY.current;

      // At the absolute top of the page (<= 15px), keep visible
      if (currentScrollY <= 15) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        setVisible(true);
        lastScrollY.current = Math.max(0, currentScrollY);
        return;
      }

      // If scrolling UP significantly, show immediately
      if (diff < -6) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        setVisible(true);
        lastScrollY.current = Math.max(0, currentScrollY);
        return;
      }

      // If scrolling DOWN, hide immediately (no dead zone)
      if (diff > 4) {
        setVisible(false);
      }

      lastScrollY.current = Math.max(0, currentScrollY);

      // Reappear smoothly after the user stops scrolling (1200ms idle delay)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, 1200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <nav
      className={`md:hidden fixed bottom-6 left-4 right-4 mx-auto max-w-[320px] z-[100] flex justify-around items-center py-3 bg-surface/85 dark:bg-surface/85 backdrop-blur-2xl border border-outline-variant/30 shadow-[0_16px_36px_rgba(0,0,0,0.12)] rounded-full px-[env(safe-area-inset-left,8px)] pb-[env(safe-area-inset-bottom,12px)] select-none ${
        visible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-36 opacity-0 scale-95 pointer-events-none"
      }`}
      style={{
        transition:
          "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, scale 0.3s ease",
        willChange: "transform, opacity",
      }}
      aria-label="Bottom Navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          (item.href === "/" && (pathname === "/" || pathname === "/home")) ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => {
              if (!isActive) vibrateLight();
            }}
            className={`flex items-center justify-center w-11 h-11 rounded-full scale-95 active:scale-85 transition-all duration-200 relative ${
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            title={item.name}
            aria-label={item.name}
          >
            <span
              className="material-symbols-outlined text-[26px] transition-transform duration-200"
              aria-hidden="true"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
                  : { fontVariationSettings: "'FILL' 0, 'wght' 300" }
              }
            >
              {item.icon}
            </span>
            <span className="sr-only">{item.name}</span>
            {isActive && (
              <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
