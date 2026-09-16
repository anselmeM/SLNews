import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cachedFetch, staleWhileRevalidate, invalidate } from "../cache";

describe("cache helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    invalidate();
  });

  afterEach(() => {
    vi.useRealTimers();
    invalidate();
  });

  describe("cachedFetch", () => {
    it("returns a fresh cached value without calling the fetcher again", async () => {
      const fetcher = vi.fn().mockResolvedValue("value");
      await expect(cachedFetch("cf1", fetcher, 30)).resolves.toBe("value");
      await expect(cachedFetch("cf1", fetcher, 30)).resolves.toBe("value");
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe("staleWhileRevalidate", () => {
    it("blocks only on the first call, then serves the cached value", async () => {
      const fetcher = vi.fn().mockResolvedValue("v1");
      await expect(staleWhileRevalidate("swr1", fetcher, 30)).resolves.toBe("v1");
      await expect(staleWhileRevalidate("swr1", fetcher, 30)).resolves.toBe("v1");
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("serves stale data immediately and refreshes in the background", async () => {
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce("old")
        .mockResolvedValueOnce("new");

      await expect(staleWhileRevalidate("swr2", fetcher, 30)).resolves.toBe("old");

      // Move past the TTL so the cached entry is now stale.
      vi.advanceTimersByTime(31_000);

      await expect(staleWhileRevalidate("swr2", fetcher, 30)).resolves.toBe("old");
      expect(fetcher).toHaveBeenCalledTimes(2); // background revalidation started

      await vi.advanceTimersByTimeAsync(0); // let the background refresh settle
      await expect(staleWhileRevalidate("swr2", fetcher, 30)).resolves.toBe("new");
    });
  });
});
