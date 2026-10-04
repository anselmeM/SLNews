import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatArticleDate,
  formatDistanceToNow,
  formatShortDate,
} from "@/lib/format-date";

// Built from local components rather than a fixed Z string, so the assertions
// hold in any test-runner timezone.
const localIso = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m, d, h).toISOString();

describe("formatArticleDate", () => {
  it("formats as 'Mon D, YYYY'", () => {
    expect(formatArticleDate(localIso(2026, 7, 5))).toBe("Aug 5, 2026");
  });

  it("does not zero-pad single-digit days", () => {
    expect(formatArticleDate(localIso(2026, 0, 9))).toBe("Jan 9, 2026");
  });

  it("formats the first and last months correctly", () => {
    expect(formatArticleDate(localIso(2026, 0, 1))).toBe("Jan 1, 2026");
    expect(formatArticleDate(localIso(2026, 11, 31))).toBe("Dec 31, 2026");
  });

  it("returns an empty string for an unparseable date", () => {
    expect(formatArticleDate("not-a-date")).toBe("");
  });
});

describe("formatShortDate", () => {
  it("formats as 'Mon D' with no year", () => {
    expect(formatShortDate(localIso(2026, 7, 5))).toBe("Aug 5");
  });

  it("returns an empty string for an unparseable date", () => {
    expect(formatShortDate("")).toBe("");
  });
});

describe("formatDistanceToNow", () => {
  const NOW = new Date(2026, 7, 5, 12, 0, 0).getTime();
  const ago = (ms: number) => NOW - ms;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("says 'Just now' under a minute", () => {
    expect(formatDistanceToNow(ago(30_000))).toBe("Just now");
  });

  it("reports minutes", () => {
    expect(formatDistanceToNow(ago(5 * 60_000))).toBe("5m ago");
  });

  it("reports hours", () => {
    expect(formatDistanceToNow(ago(3 * 3_600_000))).toBe("3h ago");
  });

  it("reports days", () => {
    expect(formatDistanceToNow(ago(2 * 86_400_000))).toBe("2d ago");
  });

  it("falls back to a short date past a week", () => {
    expect(formatDistanceToNow(ago(10 * 86_400_000))).toBe("Jul 26");
  });

  it("treats each boundary as belonging to the larger unit", () => {
    expect(formatDistanceToNow(ago(60_000))).toBe("1m ago");
    expect(formatDistanceToNow(ago(60 * 60_000))).toBe("1h ago");
    expect(formatDistanceToNow(ago(24 * 3_600_000))).toBe("1d ago");
    // Exactly seven days is the first value that uses the date fallback.
    expect(formatDistanceToNow(ago(7 * 86_400_000))).toBe("Jul 29");
  });

  it("accepts a number, a Date and a string", () => {
    const fiveMinAgo = ago(5 * 60_000);
    expect(formatDistanceToNow(fiveMinAgo)).toBe("5m ago");
    expect(formatDistanceToNow(new Date(fiveMinAgo))).toBe("5m ago");
    expect(formatDistanceToNow(new Date(fiveMinAgo).toISOString())).toBe("5m ago");
  });

  it("returns an empty string for an unparseable input", () => {
    expect(formatDistanceToNow("nonsense")).toBe("");
    expect(formatDistanceToNow(Number.NaN)).toBe("");
  });
});
