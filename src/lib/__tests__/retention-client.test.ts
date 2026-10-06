import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  recordLocalVisit,
  recordVisitAndReport,
  reportSession,
  VISIT_LOG_KEY,
} from "../retention-client";

// DOM_TESTS in vitest.config.ts: this file needs a real localStorage. Under the
// `unit` project `window` is undefined and every assertion here would pass
// vacuously against the SSR fallback.

function ok() {
  return vi.fn().mockResolvedValue({ ok: true });
}

function storedDays(): { day: string; reported: boolean }[] {
  const raw = localStorage.getItem(VISIT_LOG_KEY);
  return raw ? (JSON.parse(raw) as { days: { day: string; reported: boolean }[] }).days : [];
}

function storedDay(day: string): { day: string; reported: boolean } | undefined {
  return storedDays().find((entry) => entry.day === day);
}

describe("retention client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("records today's visit locally, pending confirmation", () => {
    const outcome = recordLocalVisit(new Date("2026-10-05T10:00:00.000Z"));

    expect(outcome).toEqual({
      isFirstVisitToday: true,
      isReturning: false,
      reported: false,
    });
    expect(storedDays()).toEqual([{ day: "2026-10-05", reported: false }]);
  });

  it("reports a first visit once, as a boolean, then marks it confirmed", async () => {
    const send = ok();

    const outcome = await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(outcome).toEqual({
      isFirstVisitToday: true,
      isReturning: false,
      reported: true,
    });
    expect(send).toHaveBeenCalledTimes(1);
    const [url, init] = send.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/analytics");
    expect(JSON.parse(String(init.body))).toEqual({
      kind: "session",
      returning: false,
    });
    expect(storedDay("2026-10-05")).toEqual({ day: "2026-10-05", reported: true });
  });

  it("reports a return visit without sending the earlier day", async () => {
    localStorage.setItem(
      VISIT_LOG_KEY,
      JSON.stringify({
        days: [
          { day: "2026-10-04", reported: true },
          { day: "2026-10-02", reported: true },
        ],
      })
    );
    const send = ok();

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
    const send = ok();

    await recordVisitAndReport(
      new Date("2026-10-05T09:00:00.000Z"),
      send as unknown as typeof fetch
    );
    const second = await recordVisitAndReport(
      new Date("2026-10-05T21:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(second.isFirstVisitToday).toBe(false);
    expect(second.reported).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("retries a day whose ping failed, and confirms it on the retry", async () => {
    const failing = vi.fn().mockRejectedValue(new Error("offline"));
    const first = await recordVisitAndReport(
      new Date("2026-10-05T08:00:00.000Z"),
      failing as unknown as typeof fetch
    );

    // The day stays pending rather than being silently dropped.
    expect(first.reported).toBe(false);
    expect(storedDay("2026-10-05")).toEqual({ day: "2026-10-05", reported: false });

    const send = ok();
    const retry = await recordVisitAndReport(
      new Date("2026-10-05T20:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(retry.reported).toBe(true);
    expect(retry.isFirstVisitToday).toBe(false);
    expect(send).toHaveBeenCalledTimes(1);
    expect(storedDay("2026-10-05")).toEqual({ day: "2026-10-05", reported: true });
  });

  it("retries when the server answers with an error", async () => {
    const serverError = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await recordVisitAndReport(
      new Date("2026-10-05T08:00:00.000Z"),
      serverError as unknown as typeof fetch
    );
    expect(storedDay("2026-10-05")?.reported).toBe(false);

    const send = ok();
    await recordVisitAndReport(
      new Date("2026-10-05T09:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(send).toHaveBeenCalledTimes(1);
    expect(storedDay("2026-10-05")?.reported).toBe(true);
  });

  it("treats a legacy string entry for today as already reported", async () => {
    localStorage.setItem(VISIT_LOG_KEY, JSON.stringify({ days: ["2026-10-05"] }));
    const send = ok();

    const outcome = await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      send as unknown as typeof fetch
    );

    expect(outcome.isFirstVisitToday).toBe(false);
    expect(outcome.reported).toBe(true);
    expect(send).not.toHaveBeenCalled();
  });

  it("never sends an older pending day, and stops tracking it", async () => {
    localStorage.setItem(
      VISIT_LOG_KEY,
      JSON.stringify({ days: [{ day: "2026-10-04", reported: false }] })
    );
    const send = ok();

    await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      send as unknown as typeof fetch
    );

    // One ping, for today: a late ping for yesterday would be stamped today.
    expect(send).toHaveBeenCalledTimes(1);
    const [, init] = send.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain('"returning":true');
    expect(storedDay("2026-10-04")).toEqual({ day: "2026-10-04", reported: true });
  });

  it("shares one request between concurrent mounts", async () => {
    const send = ok();

    await Promise.all([
      recordVisitAndReport(
        new Date("2026-10-05T10:00:00.000Z"),
        send as unknown as typeof fetch
      ),
      recordVisitAndReport(
        new Date("2026-10-05T10:00:00.000Z"),
        send as unknown as typeof fetch
      ),
    ]);

    expect(send).toHaveBeenCalledTimes(1);
  });

  it("swallows a failed report so the reader never sees it", async () => {
    const send = vi.fn().mockRejectedValue(new Error("offline"));

    await expect(
      recordVisitAndReport(
        new Date("2026-10-05T10:00:00.000Z"),
        send as unknown as typeof fetch
      )
    ).resolves.toEqual({
      isFirstVisitToday: true,
      isReturning: false,
      reported: false,
    });
  });

  it("treats a corrupted local log as no history", async () => {
    localStorage.setItem(VISIT_LOG_KEY, "{{{not json");

    const outcome = await recordVisitAndReport(
      new Date("2026-10-05T10:00:00.000Z"),
      ok() as unknown as typeof fetch
    );

    expect(outcome).toEqual({
      isFirstVisitToday: true,
      isReturning: false,
      reported: true,
    });
    expect(storedDays()).toEqual([{ day: "2026-10-05", reported: true }]);
  });
});

describe("reportSession", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("reports acceptance, not just delivery", async () => {
    await expect(reportSession(true, ok() as unknown as typeof fetch)).resolves.toBe(true);
    await expect(
      reportSession(true, vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch)
    ).resolves.toBe(false);
    await expect(
      reportSession(true, vi.fn().mockRejectedValue(new Error("nope")) as unknown as typeof fetch)
    ).resolves.toBe(false);
  });
});
