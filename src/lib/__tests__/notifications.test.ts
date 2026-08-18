import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "@/store/useNotificationStore";

describe("Notification Store Management", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [
        {
          id: "test-1",
          title: "First Notification",
          body: "This is test notification 1",
          url: "/home",
          category: "breaking",
          createdAt: Date.now() - 10000,
          read: false,
        },
        {
          id: "test-2",
          title: "Second Notification",
          body: "This is test notification 2",
          url: "/market",
          category: "market",
          createdAt: Date.now() - 20000,
          read: true,
        },
      ],
    });
  });

  it("calculates unread count correctly", () => {
    expect(useNotificationStore.getState().unreadCount()).toBe(1);
  });

  it("adds a new notification and increments unread count", () => {
    useNotificationStore.getState().addNotification({
      title: "New Headline",
      body: "Sierra Leone budget speech updates",
      url: "/article/123",
      category: "breaking",
      icon: "campaign",
    });

    const notifs = useNotificationStore.getState().notifications;
    expect(notifs.length).toBe(3);
    expect(notifs[0]?.title).toBe("New Headline");
    expect(notifs[0]?.read).toBe(false);
    expect(useNotificationStore.getState().unreadCount()).toBe(2);
  });

  it("marks a specific notification as read", () => {
    useNotificationStore.getState().markAsRead("test-1");
    const notif = useNotificationStore.getState().notifications.find((n) => n.id === "test-1");
    expect(notif?.read).toBe(true);
    expect(useNotificationStore.getState().unreadCount()).toBe(0);
  });

  it("marks all notifications as read in one action", () => {
    useNotificationStore.getState().addNotification({
      title: "Third",
      body: "Another alert",
      url: "/digest",
      category: "briefing",
    });
    expect(useNotificationStore.getState().unreadCount()).toBe(2);

    useNotificationStore.getState().markAllAsRead();
    expect(useNotificationStore.getState().unreadCount()).toBe(0);
    expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it("removes a notification by id", () => {
    useNotificationStore.getState().removeNotification("test-1");
    const notifs = useNotificationStore.getState().notifications;
    expect(notifs.length).toBe(1);
    expect(notifs.find((n) => n.id === "test-1")).toBeUndefined();
  });

  it("clears all notifications", () => {
    useNotificationStore.getState().clearAll();
    expect(useNotificationStore.getState().notifications.length).toBe(0);
    expect(useNotificationStore.getState().unreadCount()).toBe(0);
  });

  it("limits notification history to 50 items", () => {
    for (let i = 0; i < 60; i++) {
      useNotificationStore.getState().addNotification({
        title: `Story ${i}`,
        body: `Details ${i}`,
        url: `/article/${i}`,
        category: "briefing",
      });
    }
    expect(useNotificationStore.getState().notifications.length).toBe(50);
  });
});
