// SLNews service worker.
//
// Online-first strategy: this app is server-rendered and DB-backed, so HTML
// documents and API responses always come from the network. Caching documents
// here caused blank screens (a stale page shell cached from a broken deployment
// was served on fetch failures). We only cache immutable hashed build assets.
//
// The cache name is bumped whenever the caching strategy changes so old caches
// are purged on activate.

const CACHE = "slnews-v4";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        "/offline",
        "/manifest.json",
        "/icon-192x192.png",
        "/icon-512x512.png",
        "/apple-touch-icon.png",
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // Documents come from the network first; when offline, fallback to /offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE);
        return (await cache.match(request)) || (await cache.match("/offline"));
      })
    );
    return;
  }
  // API responses (auth, feeds, image proxy, ...) always come from the network.
  if (url.pathname.startsWith("/api/")) return;

  // Cache only hashed, immutable build assets.
  if (url.pathname.startsWith("/_next/") && isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/.test(pathname);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetchAndCache(request);
}

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

// ── In-app inbox ─────────────────────────────────────────────────────────────
//
// Push is broadcast (a single send fans out to every subscription, and the
// generic breaking-news push carries no user id), so "who received it" is only
// knowable on the device. This worker is also the only place that sees every
// real alert, including while the app is closed — so it records each one into
// IndexedDB and the app ingests them on load. The app's own inbox is
// localStorage, which a service worker cannot write, hence IndexedDB here.

const INBOX_DB = "slnews-inbox";
const INBOX_STORE = "notifications";
const INBOX_LIMIT = 50; // matches the in-app store's cap

function openInbox() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(INBOX_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(INBOX_STORE)) {
        db.createObjectStore(INBOX_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function recordInboxEntry(entry) {
  const db = await openInbox();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(INBOX_STORE, "readwrite");
      tx.objectStore(INBOX_STORE).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Trim oldest beyond the cap so this cannot grow forever.
    await new Promise((resolve) => {
      const tx = db.transaction(INBOX_STORE, "readwrite");
      const store = tx.objectStore(INBOX_STORE);
      const all = store.getAll();
      all.onsuccess = () => {
        const rows = all.result || [];
        if (rows.length > INBOX_LIMIT) {
          rows
            .sort((a, b) => a.createdAt - b.createdAt)
            .slice(0, rows.length - INBOX_LIMIT)
            .forEach((row) => store.delete(row.id));
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const targetUrl = data.url || (data.data && data.data.url) || "/";
    const promise = self.registration.showNotification(data.title || "SLNews", {
      body: data.body || "",
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/icon-192x192.png",
      data: { url: targetUrl, ...data.data },
      vibrate: [200, 100, 200],
      tag: data.tag || "slnews-general",
      renotify: true,
      actions: data.actions || [{ action: "open", title: "Read Story" }],
    });
    event.waitUntil(promise);

    // Record it for the in-app inbox, and poke any open tab so the list updates
    // without a reload. Both are best-effort: a failure must never stop the
    // notification from being shown.
    const entry = {
      id: (data.data && data.data.id) || `${data.tag || "slnews"}-${Date.now()}`,
      title: data.title || "SLNews",
      body: data.body || "",
      url: targetUrl,
      category: (data.data && data.data.category) || "system",
      createdAt: Date.now(),
    };

    event.waitUntil(
      recordInboxEntry(entry).catch(() => {})
    );

    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: "slnews:push-received", entry });
          }
        })
        .catch(() => {})
    );
  } catch {}
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
