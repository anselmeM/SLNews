type CacheEntry<T> = { data: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
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
      store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
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
