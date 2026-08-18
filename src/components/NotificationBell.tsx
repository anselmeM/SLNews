"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "@/lib/format-date";
import { useNotificationStore, type AppNotification } from "@/store/useNotificationStore";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  // Rehydrate store on mount
  useEffect(() => {
    useNotificationStore.persist?.rehydrate();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setOpen(false);
    router.push(notif.url);
  };

  const getCategoryBadge = (category: AppNotification["category"]) => {
    switch (category) {
      case "breaking":
        return { label: "Breaking", bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40" };
      case "briefing":
        return { label: "Briefing", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" };
      case "market":
        return { label: "Market", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" };
      case "announcement":
        return { label: "Notice", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40" };
      default:
        return { label: "News", bg: "bg-primary/10 text-primary border-primary/20" };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={open}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={unreadCount > 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/40 bg-surface-container-low">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-outline-variant/20">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">
                  notifications_paused
                </span>
                <p className="text-sm font-semibold text-on-surface">All caught up!</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  You have no notifications right now.
                </p>
              </div>
            ) : (
              recentNotifications.map((n) => {
                const badge = getCategoryBadge(n.category);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 flex items-start gap-3 hover:bg-surface-container transition-colors cursor-pointer relative group ${
                      !n.read ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute left-2 top-5 w-2 h-2 rounded-full bg-primary" />
                    )}
                    <span className="material-symbols-outlined text-xl text-primary bg-surface-container p-2 rounded-xl shrink-0 mt-0.5">
                      {n.icon || "notifications"}
                    </span>
                    <div className="flex-1 min-w-0 pl-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {formatDistanceToNow(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-on-surface line-clamp-1 leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between text-xs">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              View all notifications <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="text-on-surface-variant hover:text-on-surface flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">settings</span> Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
