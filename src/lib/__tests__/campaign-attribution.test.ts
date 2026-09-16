import { describe, it, expect } from "vitest";
import {
  ATTRIBUTION_STORAGE_KEY,
  attributionQueryString,
  captureFirstTouchAttribution,
  getStoredAttribution,
  parseCampaignParams,
  storeAttribution,
  type StorageLike,
} from "../campaign-attribution";

function memoryStorage(seed: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data: Record<string, string> = { ...seed };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("campaign-attribution", () => {
  it("parses UTM parameters and fbclid into campaign fields", () => {
    const parsed = parseCampaignParams(
      new URLSearchParams("utm_source=facebook&utm_medium=cpc&utm_campaign=dec_freetown&fbclid=abc123")
    );
    expect(parsed).toEqual({
      source: "facebook",
      medium: "cpc",
      campaign: "dec_freetown",
      fbclid: "abc123",
    });
  });

  it("returns null when no campaign parameters are present", () => {
    expect(parseCampaignParams(new URLSearchParams("page=2&q=news"))).toBeNull();
  });

  it("ignores blank parameter values", () => {
    expect(parseCampaignParams(new URLSearchParams("utm_source=&utm_medium=cpc"))).toEqual({
      medium: "cpc",
    });
  });

  it("stores and reads back attribution", () => {
    const storage = memoryStorage();
    const attr = { source: "facebook", capturedAt: "2026-12-01T00:00:00.000Z" };
    storeAttribution(attr, storage);
    expect(JSON.parse(storage.data[ATTRIBUTION_STORAGE_KEY] ?? "{}")).toEqual(attr);
    expect(getStoredAttribution(storage)).toEqual(attr);
  });

  it("captures first touch, including referrer and landing path", () => {
    const storage = memoryStorage();
    const attr = captureFirstTouchAttribution({
      search: "utm_source=tiktok&utm_campaign=leone_stars",
      referrer: "https://facebook.com/",
      landingPath: "/download",
      now: new Date("2026-12-10T09:00:00.000Z"),
      storage,
    });
    expect(attr).toMatchObject({
      source: "tiktok",
      campaign: "leone_stars",
      referrer: "https://facebook.com/",
      landingPath: "/download",
      capturedAt: "2026-12-10T09:00:00.000Z",
    });
    expect(getStoredAttribution(storage)?.source).toBe("tiktok");
  });

  it("does not overwrite an existing first touch", () => {
    const storage = memoryStorage();
    captureFirstTouchAttribution({ search: "utm_source=facebook", storage });
    const second = captureFirstTouchAttribution({ search: "utm_source=google", storage });
    expect(second?.source).toBe("facebook");
    expect(getStoredAttribution(storage)?.source).toBe("facebook");
  });

  it("returns null and stores nothing when the landing has no campaign params", () => {
    const storage = memoryStorage();
    expect(captureFirstTouchAttribution({ search: "page=2", storage })).toBeNull();
    expect(getStoredAttribution(storage)).toBeNull();
  });

  it("rebuilds a query string from stored attribution", () => {
    const qs = attributionQueryString({
      source: "facebook",
      campaign: "dec_freetown",
      capturedAt: "2026-12-01T00:00:00.000Z",
    });
    const params = new URLSearchParams(qs);
    expect(params.get("utm_source")).toBe("facebook");
    expect(params.get("utm_campaign")).toBe("dec_freetown");
  });

  it("returns an empty query string without attribution", () => {
    expect(attributionQueryString(null)).toBe("");
  });
});
