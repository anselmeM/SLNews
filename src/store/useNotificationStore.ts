import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  selectNewInboxRecords,
  toAppNotification,
  type InboxRecord,
} from "@/lib/notification-inbox";
import { browserStorage } from "@/lib/persist-storage";

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
  /**
   * Ids of device-recorded pushes already merged in. Persisted, so an alert the
   * user deleted is not resurrected by the next sync from IndexedDB.
   */
  ingestedIds: string[];
  addNotification: (notif: Omit<AppNotification, "id" | "createdAt" | "read"> & { id?: string; createdAt?: number }) => void;
  /** Merges pushes the service worker recorded. Safe to call repeatedly. */
  ingestNotifications: (records: InboxRecord[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

// Deliberately empty. This previously held two fabricated seed entries
// ("seed-briefing-1", "seed-market-1") so the inbox looked populated, while the
// real breaking-news / market / briefing pushes were never recorded at all. The
// inbox now shows what the device actually received.
const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      ingestedIds: [],
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
      ingestNotifications: (records) => {
        const fresh = selectNewInboxRecords(records, get().ingestedIds);
        if (fresh.length === 0) return;

        set((state) => ({
          notifications: [
            ...fresh.map(toAppNotification),
            ...state.notifications.filter((n) => !fresh.some((f) => f.id === n.id)),
          ].slice(0, 50),
          // Capped so this cannot grow without bound; 200 is far more than the
          // 50 the inbox can display.
          ingestedIds: [...state.ingestedIds, ...fresh.map((r) => r.id)].slice(-200),
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
      storage: createJSONStorage(browserStorage),
    }
  )
);
