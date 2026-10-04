import { afterEach, describe, expect, it, vi } from "vitest";
import { browserStorage, noopStorage } from "@/lib/persist-storage";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("noopStorage", () => {
  it("reads as empty and drops writes", () => {
    expect(noopStorage.getItem("key")).toBeNull();
    expect(noopStorage.setItem("key", "value")).toBeUndefined();
    expect(noopStorage.removeItem("key")).toBeUndefined();
  });
});

describe("browserStorage", () => {
  it("falls back to the no-op stand-in without a window", () => {
    // The `unit` project runs in node, so this is the private-preview/SSR path.
    expect(browserStorage()).toBe(noopStorage);
  });

  it("returns window.localStorage when one exists", () => {
    const fake = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("window", { localStorage: fake });

    expect(browserStorage()).toBe(fake);
  });
});
