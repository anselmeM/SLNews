import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";

describe("Theme State Management", () => {
  beforeEach(() => {
    useAppStore.setState({ theme: "system" });
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
  });

  it("updates theme to dark and applies dark class", () => {
    useAppStore.getState().setTheme("dark");
    expect(useAppStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("updates theme to light and removes dark class", () => {
    useAppStore.getState().setTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    useAppStore.getState().setTheme("light");
    expect(useAppStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("handles system theme transitions cleanly", () => {
    useAppStore.getState().setTheme("system");
    expect(useAppStore.getState().theme).toBe("system");
  });
});
