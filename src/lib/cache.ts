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

export function invalidate(pattern?: string) {
  if (!pattern) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key);
  }
}
