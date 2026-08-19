"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import MobileDrawer from "./MobileDrawer";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import NotificationBell from "@/components/NotificationBell";
import { vibrateLight } from "@/lib/haptics";
import { useAppStore } from "@/store/useAppStore";

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "National News", href: "/local-news" },
  { name: "International", href: "/world" },
  { name: "Saved", href: "/saved" },
];

export default function TopAppBar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const dataSaver = useAppStore((state) => state.dataSaver);
  const setDataSaver = useAppStore((state) => state.setDataSaver);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen to custom toggle-search event from anywhere in the app
  useEffect(() => {
    const handleToggleSearch = () => {
      setSearchModalOpen((prev) => !prev);
    };
    window.addEventListener("slnews:toggle-search", handleToggleSearch);
    return () => window.removeEventListener("slnews:toggle-search", handleToggleSearch);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDataSaverToggle = () => {
    vibrateLight();
    setDataSaver(!dataSaver);
  };

  const isActive = (href: string) =>
    href === "/home"
      ? pathname === "/home" || pathname === "/"
      : pathname.startsWith(href);

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} session={session} />
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      <header className={`fixed top-0 w-full z-[100] bg-surface/80 backdrop-blur-2xl flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        scrolled
          ? "h-[52px] border-b border-outline-variant/30 shadow-sm"
          : "h-[64px] border-b border-outline-variant/30"
      }`}>
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-3 -ml-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer lg:hidden"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant">menu</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="text-primary hover:bg-surface-container-low p-3 rounded-full transition-colors duration-200 cursor-pointer md:hidden"
            aria-label="Search news"
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          <Link href="/home" className="flex items-center">
            <span className={`font-black text-primary tracking-tight transition-all duration-300 ${
              scrolled ? "text-lg" : "text-xl"
            }`}>
              SL News
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center bg-surface-container-low rounded-2xl p-1 gap-0.5 transition-all duration-300 ${
            scrolled ? "scale-95" : ""
          }`}>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "text-primary bg-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Quick Search Spotlight Bar */}
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className={`flex-1 max-w-sm px-4 hidden md:flex items-center justify-between bg-surface-container-low border border-outline-variant/20 rounded-full py-2 pl-4 pr-3 text-xs text-on-surface-variant/70 hover:border-primary/40 hover:bg-surface-container transition-all cursor-pointer ${
            scrolled ? "opacity-0 -translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
          aria-label="Open global search spotlight"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Quick search stories, topics...</span>
          </div>
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-surface-container-high text-on-surface-variant rounded border border-outline-variant/40">
            ⌘K
          </kbd>
        </button>

        <div className={`flex items-center transition-all duration-300 ${
          scrolled ? "gap-2 sm:gap-3" : "gap-3 sm:gap-4"
        }`}>
          <NotificationBell />

          <button
            type="button"
            onClick={handleDataSaverToggle}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              dataSaver
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "hover:bg-surface-container-low text-on-surface-variant"
            }`}
            aria-label={dataSaver ? "Disable data saver" : "Enable data saver"}
            title={dataSaver ? "Data Saver: ON" : "Data Saver: OFF"}
          >
            <span className="material-symbols-outlined text-xl">
              data_saver_{dataSaver ? "on" : "off"}
            </span>
          </button>

          {session?.user && (session.user.role !== "USER") && (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              Write
            </Link>
          )}

          {session?.user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors active:scale-95 cursor-pointer min-h-[44px] min-w-[44px]"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant/30">
                    <p className="text-sm font-semibold text-on-surface truncate">{session.user.name}</p>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{session.user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">person</span>
                      Profile
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">bookmark</span>
                      Saved Stories
                    </Link>
                  </div>
                  <div className="border-t border-outline-variant/30 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/95 text-white transition-colors shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
