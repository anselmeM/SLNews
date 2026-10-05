import { describe, it, expect } from "vitest";
import {
  parseVisitDays,
  recordVisitDay,
  returningShare,
  toDayKey,
  VISIT_DAYS_LIMIT,
} from "../retention";

describe("toDayKey", () => {
  it("formats a UTC day key", () => {
    expect(toDayKey(new Date("2026-10-05T23:59:59.000Z"))).toBe("2026-10-05");
    expect(toDayKey(new Date("2026-01-01T00:00:00.000Z"))).toBe("2026-01-01");
  });
});

describe("parseVisitDays", () => {
  it("returns nothing for missing or unparseable storage", () => {
    expect(parseVisitDays(null)).toEqual([]);
    expect(parseVisitDays(undefined)).toEqual([]);
    expect(parseVisitDays("")).toEqual([]);
    expect(parseVisitDays("not json")).toEqual([]);
  });

  it("accepts both the wrapped object and a bare array", () => {
    expect(parseVisitDays(JSON.stringify({ days: ["2026-10-04"] }))).toEqual([
      "2026-10-04",
    ]);
    expect(parseVisitDays(JSON.stringify(["2026-10-04"]))).toEqual(["2026-10-04"]);
  });

  it("drops entries that are not day keys", () => {
    const raw = JSON.stringify({
      days: ["2026-10-04", 7, "yesterday", "2026-10-05T10:00:00Z", null],
    });

    expect(parseVisitDays(raw)).toEqual(["2026-10-04"]);
  });

  it("caps how many days are remembered", () => {
    const days = Array.from({ length: VISIT_DAYS_LIMIT + 5 }, (_, i) =>
      new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10)
    );

    const parsed = parseVisitDays(JSON.stringify({ days }));

    expect(parsed).toHaveLength(VISIT_DAYS_LIMIT);
    expect(parsed).not.toContain(days[0]);
    expect(parsed[parsed.length - 1]).toBe(days[days.length - 1]);
  });
});

describe("recordVisitDay", () => {
  it("counts a device with no history as a first visit", () => {
    const record = recordVisitDay([], "2026-10-05");

    expect(record.isFirstVisitToday).toBe(true);
    expect(record.isReturning).toBe(false);
    expect(record.days).toEqual(["2026-10-05"]);
  });

  it("counts a device that visited on an earlier day as returning", () => {
    const record = recordVisitDay(["2026-10-03"], "2026-10-05");

    expect(record.isFirstVisitToday).toBe(true);
    expect(record.isReturning).toBe(true);
    expect(record.days).toEqual(["2026-10-03", "2026-10-05"]);
  });

  it("is a no-op for a second visit on the same day", () => {
    const first = recordVisitDay([], "2026-10-05");
    const second = recordVisitDay(first.days, "2026-10-05");

    expect(second.isFirstVisitToday).toBe(false);
    expect(second.isReturning).toBe(false);
    expect(second.days).toEqual(["2026-10-05"]);
  });

  it("ignores a visit dated in the future when deciding 'returning'", () => {
    const record = recordVisitDay(["2026-10-09"], "2026-10-05");

    expect(record.isReturning).toBe(false);
  });

  it("caps the log at the remembered limit", () => {
    const days = Array.from({ length: VISIT_DAYS_LIMIT }, (_, i) => `2026-01-01+${i}`);

    const record = recordVisitDay(days, "2026-10-05");

    expect(record.days).toHaveLength(VISIT_DAYS_LIMIT);
    expect(record.days[record.days.length - 1]).toBe("2026-10-05");
    expect(record.days).not.toContain("2026-01-01+0");
  });
});

describe("returningShare", () => {
  it("is null when a day had no sessions", () => {
    expect(returningShare(0, 0)).toBeNull();
  });

  it("is the share of sessions that are returns", () => {
    expect(returningShare(3, 1)).toBeCloseTo(0.25);
    expect(returningShare(0, 4)).toBe(1);
    expect(returningShare(4, 0)).toBe(0);
  });
});
