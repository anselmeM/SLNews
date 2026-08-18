"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { formatDistanceToNow } from "@/lib/format-date";
import { useNotificationStore, type AppNotification, type NotificationType } from "@/store/useNotificationStore";

export default function NotificationsClient() {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | NotificationType>("all");
  const router = useRouter();
  const { toast } = useToast();

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);

  useEffect(() => {
    useNotificationStore.persist?.rehydrate();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.category === activeTab;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    router.push(notif.url);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeNotification(id);
    toast("Notification removed", "info");
  };

  const handleClearAll = () => {
    clearAll();
    toast("All notifications cleared", "info");
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

  const tabs: { key: "all" | "unread" | NotificationType; label: string; count?: number }[] = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "breaking", label: "Breaking" },
    { key: "briefing", label: "Briefings" },
    { key: "market", label: "Market & FX" },
    { key: "announcement", label: "Notices" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-primary text-white shadow-xs">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time updates, breaking alerts, morning digests, and market price changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-full font-bold text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 rounded-full font-bold text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer min-h-[38px]"
            >
              Clear all
            </button>
          )}
          <Link
            href="/profile"
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer min-h-[38px] flex items-center justify-center"
            title="Notification Settings"
            aria-label="Notification Settings"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </Link>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-outline-variant/40">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                active
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl overflow-hidden shadow-xs divide-y divide-outline-variant/30">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">
              notifications_off
            </span>
            <h3 className="text-base font-bold text-on-surface">No notifications found</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto leading-relaxed">
              {activeTab === "unread"
                ? "You've read all your notifications! Check back later for breaking updates."
                : "No notifications matching this category yet. You can customize your alert preferences in Settings."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/home"
                className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
              >
                Browse Latest Stories
              </Link>
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const badge = getCategoryBadge(n.category);
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 flex items-start gap-4 hover:bg-surface-container/60 transition-all cursor-pointer relative group ${
                  !n.read ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                {!n.read && (
                  <span className="absolute left-2.5 top-6 w-2 h-2 rounded-full bg-primary" />
                )}
                <span className="material-symbols-outlined text-2xl text-primary bg-surface-container p-3 rounded-2xl shrink-0 mt-0.5 shadow-xs">
                  {n.icon || "notifications"}
                </span>

                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {formatDistanceToNow(n.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                    {n.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                    {n.body}
                  </p>
                </div>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, n.id)}
                  className="absolute right-4 top-5 p-2 rounded-full text-on-surface-variant/50 hover:text-red-500 hover:bg-red-500/10 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remove notification"
                  aria-label="Remove notification"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
