"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import MobileDrawer from "./MobileDrawer";

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "Local", href: "/local" },
  { name: "National", href: "/national" },
  { name: "International", href: "/world" },
  { name: "Saved", href: "/saved" },
];

export default function TopAppBar({ session }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const dataSaver = useAppStore((state) => state.dataSaver);
  const setDataSaver = useAppStore((state) => state.setDataSaver);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrollPosition();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleDataSaverToggle = () => {
    setDataSaver(!dataSaver);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (href: string) =>
    href === "/home"
      ? pathname === "/home" || pathname === "/"
      : pathname.startsWith(href);

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} session={session} />

      <header className={`fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-2xl flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        scrolled
          ? "h-[52px] border-b border-outline-variant/30 shadow-sm"
          : "h-[64px] border-b border-outline-variant/30"
      }`}>
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-3 -ml-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer lg:hidden"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant">menu</span>
          </button>

          <Link href="/search" className="text-primary hover:bg-surface-container-low p-3 rounded-full transition-colors duration-200 cursor-pointer md:hidden" aria-label="Search news">
            <span className="material-symbols-outlined">search</span>
          </Link>

          <Link href="/home" className="flex items-center">
            <h1 className={`font-black text-primary tracking-tight transition-all duration-300 ${
              scrolled ? "text-lg" : "text-xl"
            }`}>
              SL News
            </h1>
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

        <form onSubmit={handleSearch} className={`flex-1 max-w-sm px-4 hidden md:block relative transition-all duration-300 ${
          scrolled ? "opacity-0 -translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
        }`}>
          <span className="material-symbols-outlined absolute left-7 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-surface transition-all"
            placeholder="Search news..."
            type="text"
          />
        </form>

        <div className={`flex items-center transition-all duration-300 ${
          scrolled ? "gap-3" : "gap-4"
        }`}>
          <button
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
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut(); }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-error hover:bg-error-container transition-colors cursor-pointer font-medium min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold px-5 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
