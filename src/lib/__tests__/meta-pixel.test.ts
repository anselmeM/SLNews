import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getMetaPixelId,
  trackMetaEvent,
  trackCustomMetaEvent,
} from "../meta-pixel";

describe("meta-pixel utility", () => {
  const originalEnv = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  beforeEach(() => {
    delete window.fbq;
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID = "123456789";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID = originalEnv;
    delete window.fbq;
  });

  it("reads the pixel id from env", () => {
    expect(getMetaPixelId()).toBe("123456789");
  });

  it("safely handles trackMetaEvent when fbq is not loaded", () => {
    expect(() => {
      trackMetaEvent("PageView");
    }).not.toThrow();
  });

  it("calls window.fbq('track', ...) when fbq is present", () => {
    const mockFbq = vi.fn();
    window.fbq = mockFbq;

    trackMetaEvent("PageView");
    expect(mockFbq).toHaveBeenCalledWith("track", "PageView");

    trackMetaEvent("ViewContent", { content_name: "Sierra Leone Headline" });
    expect(mockFbq).toHaveBeenCalledWith("track", "ViewContent", {
      content_name: "Sierra Leone Headline",
    });
  });

  it("calls window.fbq('trackCustom', ...) for custom events", () => {
    const mockFbq = vi.fn();
    window.fbq = mockFbq;

    trackCustomMetaEvent("AppInstallPrompt", { outcome: "accepted" });
    expect(mockFbq).toHaveBeenCalledWith("trackCustom", "AppInstallPrompt", {
      outcome: "accepted",
    });
  });

  it("silently swallows any exception thrown inside fbq", () => {
    window.fbq = vi.fn(() => {
      throw new Error("Meta Pixel Error");
    });

    expect(() => {
      trackMetaEvent("PageView");
    }).not.toThrow();
  });
});
