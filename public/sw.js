// SLNews service worker.
//
// Online-first strategy: this app is server-rendered and DB-backed, so HTML
// documents and API responses always come from the network. Caching documents
// here caused blank screens (a stale page shell cached from a broken deployment
// was served on fetch failures). We only cache immutable hashed build assets.
//
// The cache name is bumped whenever the caching strategy changes so old caches
// are purged on activate.

const CACHE = "slnews-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
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
  // Documents always come from the network — never serve a stale cached page.
  if (request.mode === "navigate") return;
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
