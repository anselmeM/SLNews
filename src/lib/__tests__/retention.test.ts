import { describe, it, expect } from "vitest";
import {
  markReported,
  parseVisitDays,
  recordVisitDay,
  returningShare,
  toDayKey,
  VISIT_DAYS_LIMIT,
  type VisitDay,
} from "../retention";

const day = (value: string, reported = true): VisitDay => ({ day: value, reported });

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
    expect(parseVisitDays(JSON.stringify({ days: [day("2026-10-04")] }))).toEqual([
      day("2026-10-04"),
    ]);
    expect(parseVisitDays(JSON.stringify([day("2026-10-04")]))).toEqual([
      day("2026-10-04"),
    ]);
  });

  it("reads the pre-`reported` format as already reported", () => {
    // Written by the version that shipped before this flag existed: the ping
    // cannot be confirmed either way, and re-sending could double-count.
    expect(parseVisitDays(JSON.stringify({ days: ["2026-10-04"] }))).toEqual([
      day("2026-10-04", true),
    ]);
  });

  it("keeps an explicitly unreported day pending", () => {
    expect(
      parseVisitDays(JSON.stringify({ days: [{ day: "2026-10-04", reported: false }] }))
    ).toEqual([day("2026-10-04", false)]);
  });

  it("drops entries that are not day keys", () => {
    const raw = JSON.stringify({
      days: ["2026-10-04", 7, "yesterday", "2026-10-05T10:00:00Z", null, { day: "nope" }],
    });

    expect(parseVisitDays(raw)).toEqual([day("2026-10-04")]);
  });

  it("treats a duplicate day as reported when either copy was", () => {
    const raw = JSON.stringify({
      days: [
        { day: "2026-10-04", reported: false },
        { day: "2026-10-04", reported: true },
      ],
    });

    expect(parseVisitDays(raw)).toEqual([day("2026-10-04", true)]);
  });

  it("caps how many days are remembered", () => {
    const days = Array.from({ length: VISIT_DAYS_LIMIT + 5 }, (_, i) =>
      new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10)
    );

    const parsed = parseVisitDays(JSON.stringify({ days }));

    expect(parsed).toHaveLength(VISIT_DAYS_LIMIT);
    expect(parsed.map((visit) => visit.day)).not.toContain(days[0]);
    expect(parsed[parsed.length - 1]?.day).toBe(days[days.length - 1]);
  });
});

describe("recordVisitDay", () => {
  it("counts a device with no history as a first visit that still needs reporting", () => {
    const record = recordVisitDay([], "2026-10-05");

    expect(record.isFirstVisitToday).toBe(true);
    expect(record.isReturning).toBe(false);
    expect(record.needsReport).toBe(true);
    expect(record.days).toEqual([day("2026-10-05", false)]);
  });

  it("counts a device that visited on an earlier day as returning", () => {
    const record = recordVisitDay([day("2026-10-03")], "2026-10-05");

    expect(record.isFirstVisitToday).toBe(true);
    expect(record.isReturning).toBe(true);
    expect(record.days).toEqual([day("2026-10-03"), day("2026-10-05", false)]);
  });

  it("does not re-report a day the server already confirmed", () => {
    const confirmed = recordVisitDay([], "2026-10-05");
    const reported = { ...confirmed, days: markReported(confirmed.days, "2026-10-05") };

    const second = recordVisitDay(reported.days, "2026-10-05");

    expect(second.isFirstVisitToday).toBe(false);
    expect(second.isReturning).toBe(false);
    expect(second.needsReport).toBe(false);
  });

  it("keeps retrying a day that was never confirmed", () => {
    const first = recordVisitDay([], "2026-10-05");

    const second = recordVisitDay(first.days, "2026-10-05");

    expect(second.isFirstVisitToday).toBe(false);
    expect(second.needsReport).toBe(true);
  });

  it("abandons an older day that can no longer be attributed", () => {
    // The endpoint stamps its own UTC day, so yesterday's ping sent today would
    // be counted today: it is dropped rather than left pending forever.
    const record = recordVisitDay([day("2026-10-03", false), day("2026-10-04", false)], "2026-10-05");

    expect(record.days).toEqual([
      day("2026-10-03", true),
      day("2026-10-04", true),
      day("2026-10-05", false),
    ]);
    expect(record.needsReport).toBe(true);
  });

  it("ignores a visit dated in the future when deciding 'returning'", () => {
    const record = recordVisitDay([day("2026-10-09")], "2026-10-05");

    expect(record.isReturning).toBe(false);
  });

  it("caps the log at the remembered limit", () => {
    const days = Array.from({ length: VISIT_DAYS_LIMIT }, (_, i) => day(`2026-01-01+${i}`));

    const record = recordVisitDay(days, "2026-10-05");

    expect(record.days).toHaveLength(VISIT_DAYS_LIMIT);
    expect(record.days[record.days.length - 1]?.day).toBe("2026-10-05");
    expect(record.days.map((visit) => visit.day)).not.toContain("2026-01-01+0");
  });
});

describe("markReported", () => {
  it("confirms only the named day", () => {
    const days = [day("2026-10-04", false), day("2026-10-05", false)];

    expect(markReported(days, "2026-10-05")).toEqual([
      day("2026-10-04", false),
      day("2026-10-05", true),
    ]);
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
