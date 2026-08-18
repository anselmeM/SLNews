import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "breaking" | "briefing" | "market" | "announcement" | "system";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  url: string;
  category: NotificationType;
  createdAt: number;
  read: boolean;
  icon?: string;
};

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, "id" | "createdAt" | "read"> & { id?: string; createdAt?: number }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "seed-briefing-1",
    title: "Daily Sierra Leone Briefing",
    body: "Your morning digest is ready with national headlines and market prices.",
    url: "/digest",
    category: "briefing",
    createdAt: Date.now() - 1000 * 60 * 45, // 45m ago
    read: false,
    icon: "newspaper",
  },
  {
    id: "seed-market-1",
    title: "Market & FX Rate Update",
    body: "USD/SLL and fuel commodity prices updated across Freetown and Bo markets.",
    url: "/market",
    category: "market",
    createdAt: Date.now() - 1000 * 60 * 180, // 3h ago
    read: false,
    icon: "trending_up",
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      addNotification: (notif) => {
        const item: AppNotification = {
          id: notif.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: notif.title,
          body: notif.body,
          url: notif.url,
          category: notif.category,
          createdAt: notif.createdAt ?? Date.now(),
          read: false,
          icon: notif.icon,
        };
        set((state) => ({
          notifications: [item, ...state.notifications.filter((n) => n.id !== item.id)].slice(0, 50),
        }));
      },
      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },
      clearAll: () => {
        set({ notifications: [] });
      },
      unreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: "slnews-notifications-storage",
      skipHydration: true,
    }
  )
);
