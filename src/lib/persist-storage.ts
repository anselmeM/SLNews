import type { StateStorage } from "zustand/middleware";

/**
 * Storage stand-in used where there is no browser: SSR/prerender, and the
 * `node` half of the test suite. Reads return nothing and writes are dropped.
 */
export const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * Resolves Web Storage, or a no-op stand-in when `window` is unavailable.
 *
 * zustand's `persist` defaults to `createJSONStorage(() => window.localStorage)`
 * (see `node_modules/zustand/middleware.js`). That dereferences `window`, and
 * wherever `window` is missing the access throws — zustand catches it and
 * silently degrades to "no storage", which additionally makes it `console.warn`
 * on *every* state update. Passing this to `createJSONStorage` keeps SSR/prerender
 * quiet and makes the fallback deliberate rather than an accident of a thrown error.
 */
export function browserStorage(): StateStorage {
  return typeof window === "undefined" ? noopStorage : window.localStorage;
}
