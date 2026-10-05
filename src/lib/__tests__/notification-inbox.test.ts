import { describe, expect, it, vi } from "vitest";
import {
  readInboxRecords,
  selectNewInboxRecords,
  subscribeToInboxMessages,
  toAppNotification,
  toNotificationCategory,
  type InboxRecord,
} from "@/lib/notification-inbox";

const record = (over: Partial<InboxRecord> = {}): InboxRecord => ({
  id: "rec-1",
  title: "Breaking News",
  body: "3 new articles on SLNews.",
  url: "/",
  category: "breaking",
  createdAt: 1_000,
  ...over,
});

describe("toNotificationCategory", () => {
  it("keeps the categories the push sender uses", () => {
    expect(toNotificationCategory("breaking")).toBe("breaking");
    expect(toNotificationCategory("market")).toBe("market");
    expect(toNotificationCategory("briefing")).toBe("briefing");
  });

  it("degrades anything unknown to system", () => {
    // The worker passes through whatever the push payload carried, so this must
    // never produce a category the UI cannot render.
    expect(toNotificationCategory("nonsense")).toBe("system");
    expect(toNotificationCategory("")).toBe("system");
    expect(toNotificationCategory("BREAKING")).toBe("system");
  });
});

describe("toAppNotification", () => {
  it("maps a received push into the inbox shape", () => {
    const mapped = toAppNotification(record());

    expect(mapped).toMatchObject({
      id: "rec-1",
      title: "Breaking News",
      body: "3 new articles on SLNews.",
      url: "/",
      category: "breaking",
      createdAt: 1_000,
      read: false,
    });
  });

  it("picks an icon per category and falls back for unknown ones", () => {
    expect(toAppNotification(record({ category: "market" })).icon).toBe("trending_up");
    expect(toAppNotification(record({ category: "briefing" })).icon).toBe("newspaper");
    expect(toAppNotification(record({ category: "who-knows" })).icon).toBe("notifications");
  });

  it("always starts unread", () => {
    expect(toAppNotification(record()).read).toBe(false);
  });
});

describe("selectNewInboxRecords", () => {
  it("returns everything on a first sync", () => {
    const selected = selectNewInboxRecords(
      [record({ id: "a", createdAt: 1 }), record({ id: "b", createdAt: 2 })],
      []
    );

    expect(selected.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("drops records already ingested", () => {
    const selected = selectNewInboxRecords(
      [record({ id: "a" }), record({ id: "b" })],
      ["a"]
    );

    expect(selected.map((r) => r.id)).toEqual(["b"]);
  });

  it("returns nothing once everything has been ingested", () => {
    expect(selectNewInboxRecords([record({ id: "a" })], ["a"])).toEqual([]);
  });

  it("orders newest first regardless of storage order", () => {
    const selected = selectNewInboxRecords(
      [
        record({ id: "old", createdAt: 100 }),
        record({ id: "newest", createdAt: 900 }),
        record({ id: "middle", createdAt: 500 }),
      ],
      []
    );

    expect(selected.map((r) => r.id)).toEqual(["newest", "middle", "old"]);
  });
});

describe("browser-only adapters", () => {
  it("reads an empty inbox when IndexedDB is unavailable", async () => {
    // Neither the `unit` project (node) nor jsdom implements IndexedDB, so this
    // is the path both environments actually take. It must degrade to an empty
    // list rather than throw during render.
    expect(await readInboxRecords()).toEqual([]);
  });

  it("subscribes as a no-op without a service worker", () => {
    const handler = vi.fn();

    const unsubscribe = subscribeToInboxMessages(handler);

    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });
});
