import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  recordLocalVisit,
  recordVisitAndReport,
  VISIT_LOG_KEY,
} from "../retention-client";

// DOM_TESTS in vitest.config.ts: this file needs a real localStorage. Under the
// `unit` project `window` is undefined and every assertion here would pass
// vacuously against the SSR fallback.

function fetchMock() {
  return vi.fn().mockResolvedValue({ ok: true });
}

function storedDays(): string[] {
  const raw = localStorage.getItem(VISIT_LOG_KEY);
  return raw ? (JSON.parse(raw) as { days: string[] }).days : [];
}

describe("retention client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("records today's visit locally", () => {
    const outcome = recordLocalVisit(new Date("2026-10-05T10:00:00.000Z"));

    expect(outcome).toEqual({ isFirstVisitToday: true, isReturning: false });
    expect(storedDays()).toEqual(["2026-10-05"]);
  });

  it("reports a first visit once, as a boolean", async () => {
    const send = fetchMock();

    const outcome = await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(outcome).toEqual({ isFirstVisitToday: true, isReturning: false });
    expect(send).toHaveBeenCalledTimes(1);
    const [url, init] = send.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/analytics");
    expect(JSON.parse(String(init.body))).toEqual({
      kind: "session",
      returning: false,
    });
  });

  it("reports a return visit without sending the earlier day", async () => {
    localStorage.setItem(
      VISIT_LOG_KEY,
      JSON.stringify({ days: ["2026-10-04", "2026-10-02"] })
    );
    const send = fetchMock();

    const outcome = await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(outcome.isReturning).toBe(true);
    const [, init] = send.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      kind: "session",
      returning: true,
    });
    // Nothing but the boolean is sent — the visit history stays on the device.
    expect(String(init.body)).not.toContain("2026-10-04");
  });

  it("does not report a second session on the same day", async () => {
    const send = fetchMock();

    await recordVisitAndReport(
      new Date("2026-10-05T09:00:00.000Z"),
      send as unknown as typeof fetch
    );
    const second = await recordVisitAndReport(
      new Date("2026-10-05T21:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(second.isFirstVisitToday).toBe(false);
    expect(send).toHaveBeenCalledTimes(1);
    expect(storedDays()).toEqual(["2026-10-05"]);
  });

  it("swallows a failed report so the reader never sees it", async () => {
    const send = vi.fn().mockRejectedValue(new Error("offline"));

    await expect(
      recordVisitAndReport(
        new Date("2026-10-05T10:00:00.000Z"),
        send as unknown as typeof fetch
      )
    ).resolves.toEqual({ isFirstVisitToday: true, isReturning: false });
  });

  it("treats a corrupted local log as no history", async () => {
    localStorage.setItem(VISIT_LOG_KEY, "{{{not json");

    const outcome = await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      fetchMock() as unknown as typeof fetch
    );

    expect(outcome).toEqual({ isFirstVisitToday: true, isReturning: false });
    expect(storedDays()).toEqual(["2026-10-05"]);
  });
});
