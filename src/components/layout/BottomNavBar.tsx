"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/home", icon: "home" },
    { name: "Local", href: "/local", icon: "map" },
    { name: "National", href: "/national", icon: "flag" },
    { name: "World", href: "/world", icon: "public" },
    { name: "Saved", href: "/saved", icon: "bookmark" },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 mx-auto max-w-[320px] z-50 flex justify-around items-center py-3 bg-surface/75 dark:bg-surface/75 backdrop-blur-xl border border-outline-variant/30 shadow-[0_16px_36px_rgba(0,0,0,0.08)] rounded-full px-[env(safe-area-inset-left,8px)] pb-[env(safe-area-inset-bottom,12px)]">
      {navItems.map((item) => {
        const isActive = (item.href === "/home" && (pathname === "/home" || pathname === "/"))
          || (item.href !== "/home" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-center w-11 h-11 rounded-full scale-95 active:scale-90 transition-transform relative ${
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            title={item.name}
            aria-label={item.name}
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : { fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              {item.icon}
            </span>
            {isActive && (
              <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
