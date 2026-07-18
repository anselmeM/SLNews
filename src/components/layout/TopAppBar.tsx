"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "National", href: "/news" },
  { name: "International", href: "/world" },
  { name: "Saved", href: "/saved" },
];

export default function TopAppBar({ session }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const dataSaver = useAppStore((state) => state.dataSaver);
  const setDataSaver = useAppStore((state) => state.setDataSaver);
  const [searchQuery, setSearchQuery] = useState("");

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
      <header className="fixed top-0 w-full h-[64px] z-40 bg-surface/80 backdrop-blur-2xl border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/search" className="text-primary hover:bg-surface-container-low p-3 rounded-full transition-colors duration-200 cursor-pointer md:hidden" aria-label="Search news">
            <span className="material-symbols-outlined">search</span>
          </Link>

          <Link href="/home" className="flex items-center">
            <h1 className="text-xl font-black text-primary tracking-tight">
              SL News
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center bg-surface-container-low rounded-2xl p-1 gap-0.5">
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

        <form onSubmit={handleSearch} className="flex-1 max-w-sm px-4 hidden md:block relative">
          <span className="material-symbols-outlined absolute left-7 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-surface transition-all"
            placeholder="Search news..."
            type="text"
          />
        </form>

        <div className="flex items-center gap-4">
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
            <div className="relative group focus-within:opacity-100">
              <Link
                href="/profile"
                className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors active:scale-95"
                aria-expanded={false}
                aria-haspopup="true"
              >
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </Link>
              <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-outline-variant/30">
                  <p className="text-sm font-semibold text-on-surface truncate">{session.user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{session.user.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error-container transition-colors cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
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
