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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Always show when near the very top of the page (< 60px)
      if (currentScrollY < 60) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        setVisible(true);
        return;
      }

      // Always show when reached the bottom of the page
      if (windowHeight + currentScrollY >= documentHeight - 60) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        setVisible(true);
        return;
      }

      // User is actively scrolling: immediately hide the navbar to maximize view area
      setVisible(false);

      // Reset existing idle timer
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reappear smoothly after the user stops scrolling (350ms idle delay)
      scrollTimeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <nav
      className={`md:hidden fixed bottom-6 left-4 right-4 mx-auto max-w-[320px] z-[100] flex justify-around items-center py-3 bg-surface/85 dark:bg-surface/85 backdrop-blur-2xl border border-outline-variant/30 shadow-[0_16px_36px_rgba(0,0,0,0.12)] rounded-full px-[env(safe-area-inset-left,8px)] pb-[env(safe-area-inset-bottom,12px)] transition-all duration-300 ease-out select-none ${
        visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-28 opacity-0 scale-95 pointer-events-none"
      }`}
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
