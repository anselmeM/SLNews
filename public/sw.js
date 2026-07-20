const CACHE = "slnews-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        "/",
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

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/.test(pathname);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetchAndCache(request);
}

async function networkFirst(request) {
  try {
    return await fetchAndCache(request);
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Offline — please check your connection.", { status: 503, statusText: "Offline" });
  }
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
    const promise = self.registration.showNotification(data.title || "SLNews", {
      body: data.body || "",
      icon: data.icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: { url: data.url || "/home" },
      vibrate: [200, 100, 200],
      tag: "slnews-breaking",
    });
    event.waitUntil(promise);
  } catch {}
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url) && "focus" in c);
      if (existing) {
        existing.focus();
      } else if (self.clients.openWindow) {
        self.clients.openWindow(url);
      }
    })
  );
});
