"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import type { Session } from "next-auth";
import { useAppStore } from "@/store/useAppStore";
import PushToggle from "@/components/PushToggle";

interface Props {
  open: boolean;
  onClose: () => void;
  session: Session | null;
}

const links = [
  { name: "Home", href: "/home", icon: "home" },
  { name: "Local News", href: "/local-news", icon: "map" },
  { name: "International", href: "/world", icon: "public" },
  { name: "Saved", href: "/saved", icon: "bookmark" },
  { name: "Profile", href: "/profile", icon: "person" },
];

const secondaryLinks = [
  { name: "Announcements", href: "/announcements", icon: "campaign" },
  { name: "Market", href: "/market", icon: "trending_up" },
  { name: "About", href: "/about", icon: "info" },
];

export default function MobileDrawer({ open, onClose, session }: Props) {
  const pathname = usePathname();
  const dataSaver = useAppStore((s) => s.dataSaver);
  const setDataSaver = useAppStore((s) => s.setDataSaver);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/home"
      ? pathname === "/home" || pathname === "/"
      : pathname.startsWith(href);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-surface dark:bg-surface-container-lowest shadow-2xl flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
              <Link href="/home" className="flex items-center" onClick={onClose}>
                <h1 className="text-xl font-black text-primary tracking-tight">SL News</h1>
              </Link>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                );
              })}

              {/* Secondary Links */}
              <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">More</p>
              </div>
              {secondaryLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-outline-variant/30 px-4 py-4 space-y-3">
              <button
                onClick={() => setDataSaver(!dataSaver)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  data_saver_{dataSaver ? "on" : "off"}
                </span>
                Data Saver {dataSaver ? "ON" : "OFF"}
              </button>

              <PushToggle />

              {session?.user ? (
                <>
                  <div className="px-4 py-2 rounded-2xl bg-surface-container-low">
                    <p className="text-sm font-semibold text-on-surface truncate">{session.user.name}</p>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{session.user.email}</p>
                  </div>
                  {(session.user.role as string) !== "USER" && (
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[22px]">edit_square</span>
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-error hover:bg-error-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">login</span>
                  Sign In
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
