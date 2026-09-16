type CacheEntry<T> = { data: T; expiresAt: number };

const MAX_ENTRIES = 500;
const store = new Map<string, CacheEntry<unknown>>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

function setEntry<T>(key: string, data: T, ttlSeconds: number) {
  // If at capacity, evict the oldest key (FIFO)
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) store.delete(oldestKey);
  }
  store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  prune();
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) return Promise.resolve(entry.data);

  return fetcher()
    .then((data) => {
      setEntry(key, data, ttlSeconds);
      return data;
    })
    .catch((err) => {
      if (entry) return entry.data;
      throw err;
    });
}

/**
 * Stale-while-revalidate read: returns the cached value immediately — even once
 * it has passed its TTL — and refreshes it in the background, so top news
 * routes keep serving instant cached content instead of blocking the reader on
 * a database round-trip. The very first call for a key has nothing to serve, so
 * it awaits the fetcher.
 */
export function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry && Date.now() < entry.expiresAt) {
    prune();
    return Promise.resolve(entry.data);
  }

  if (entry) {
    prune();
    // Serve the stale value now and revalidate in the background.
    void fetcher()
      .then((data) => setEntry(key, data, ttlSeconds))
      .catch(() => {
        // Keep serving the stale value if the background refresh fails.
      });
    return Promise.resolve(entry.data);
  }

  prune();
  return fetcher().then((data) => {
    setEntry(key, data, ttlSeconds);
    return data;
  });
}

export function invalidate(pattern?: string) {
  if (!pattern) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key);
  }
}
