import type { AppNotification, NotificationType } from "@/store/useNotificationStore";

/**
 * Bridges the service worker's record of received pushes into the in-app inbox.
 *
 * The worker is the only place that sees every real alert — including while the
 * app is closed — and push is *broadcast* (one send fans out to up to 1000
 * subscriptions, and the generic breaking-news push carries no user id), so
 * "who received this" is only knowable on the device. Hence a device-local
 * IndexedDB inbox written by the worker and ingested here, rather than a
 * server-side notification table.
 *
 * Storage differs by necessity: the in-app store is localStorage, which a
 * service worker cannot write, so the worker records into IndexedDB and this
 * module reads it on load.
 */

export const INBOX_DB_NAME = "slnews-inbox";
export const INBOX_STORE_NAME = "notifications";

/** A push this device actually received, as recorded by the service worker. */
export type InboxRecord = {
  id: string;
  title: string;
  body: string;
  url: string;
  category: string;
  createdAt: number;
};

const CATEGORIES: readonly NotificationType[] = [
  "breaking",
  "briefing",
  "market",
  "announcement",
  "system",
];

const ICONS: Record<NotificationType, string> = {
  breaking: "bolt",
  briefing: "newspaper",
  market: "trending_up",
  announcement: "campaign",
  system: "notifications",
};

/** The worker sends a free-form category, so anything unknown degrades to "system". */
export function toNotificationCategory(value: string): NotificationType {
  return (CATEGORIES as readonly string[]).includes(value)
    ? (value as NotificationType)
    : "system";
}

export function toAppNotification(record: InboxRecord): AppNotification {
  const category = toNotificationCategory(record.category);
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    url: record.url,
    category,
    createdAt: record.createdAt,
    read: false,
    icon: ICONS[category],
  };
}

/**
 * Records not already ingested, newest first.
 *
 * `ingestedIds` is what makes this idempotent *and* respects deletion: without
 * it, an alert the user swiped away would reappear on every reload, because the
 * record stays in IndexedDB.
 */
export function selectNewInboxRecords(
  records: InboxRecord[],
  ingestedIds: string[]
): InboxRecord[] {
  const seen = new Set(ingestedIds);
  return records
    .filter((record) => !seen.has(record.id))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function openInbox(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INBOX_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(INBOX_STORE_NAME)) {
        db.createObjectStore(INBOX_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Reads the worker's inbox. Never throws: a missing IndexedDB (jsdom, older
 * browsers) or a blocked upgrade should leave the in-app list empty, not break
 * the page.
 */
export async function readInboxRecords(): Promise<InboxRecord[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openInbox();
    try {
      return await new Promise<InboxRecord[]>((resolve) => {
        const tx = db.transaction(INBOX_STORE_NAME, "readonly");
        const request = tx.objectStore(INBOX_STORE_NAME).getAll();
        request.onsuccess = () => resolve((request.result ?? []) as InboxRecord[]);
        request.onerror = () => resolve([]);
      });
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

/**
 * Listens for the worker poking an open tab, so an alert that arrives while the
 * app is in the foreground lands in the list without a reload.
 */
export function subscribeToInboxMessages(
  handler: (record: InboxRecord) => void
): () => void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return () => {};
  }

  const listener = (event: MessageEvent) => {
    const data = event.data as { type?: string; entry?: InboxRecord } | null;
    if (data?.type === "slnews:push-received" && data.entry) {
      handler(data.entry);
    }
  };

  navigator.serviceWorker.addEventListener("message", listener);
  return () => navigator.serviceWorker.removeEventListener("message", listener);
}
