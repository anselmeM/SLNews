import { browserStorage } from "./persist-storage";
import {
  markReported,
  parseVisitDays,
  recordVisitDay,
  toDayKey,
  type VisitDay,
  type VisitOutcome,
} from "./retention";

/**
 * Return-rate plumbing, browser half.
 *
 * The visit log lives on the device, so the server never receives an identifier,
 * a cookie, or a history — only one anonymous "was this a return?" boolean per
 * device per day. See `src/lib/retention.ts` for why the metric is shaped that
 * way.
 *
 * A day is only marked reported once the server has accepted it, so a failed
 * ping leaves the day pending and the next page load retries it. That matters
 * because the readers most likely to lose a request are the ones on the worst
 * mobile connections: losing exactly their sessions would bias the metric, not
 * merely shrink it.
 */

export const VISIT_LOG_KEY = "slnews-visit-days";

export type { VisitOutcome };

/** Read once per page: a remount must not fire a second ping. */
let inFlight: Promise<VisitOutcome> | null = null;

function readDays(storage: ReturnType<typeof browserStorage>): VisitDay[] {
  const raw = storage.getItem(VISIT_LOG_KEY);
  // `StateStorage.getItem` may return a promise; localStorage never does, and a
  // promise here would only mean "no readable log".
  return parseVisitDays(typeof raw === "string" ? raw : null);
}

function writeDays(
  storage: ReturnType<typeof browserStorage>,
  days: readonly VisitDay[]
): void {
  storage.setItem(VISIT_LOG_KEY, JSON.stringify({ days }));
}

export function recordLocalVisit(now: Date = new Date()): VisitOutcome {
  if (typeof window === "undefined") {
    // Nothing to record during SSR/prerender, and nothing to report.
    return { isFirstVisitToday: false, isReturning: false, reported: false };
  }

  const storage = browserStorage();
  const today = toDayKey(now);
  const record = recordVisitDay(readDays(storage), today);
  writeDays(storage, record.days);

  return {
    isFirstVisitToday: record.isFirstVisitToday,
    isReturning: record.isReturning,
    reported: false,
  };
}

/**
 * Sends the session ping. Returns whether the server accepted it — the endpoint
 * *increments* a counter, so it is not idempotent, and this answer is what
 * decides whether the local day may be treated as confirmed.
 */
export async function reportSession(
  isReturning: boolean,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  try {
    const response = await fetchImpl("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "session", returning: isReturning }),
      keepalive: true,
    });
    return response.ok;
  } catch {
    // Instrumentation only: a failed ping must never surface to the reader.
    return false;
  }
}

/**
 * Records today's visit and reports it, retrying a day the server has not
 * confirmed. A load after a successful ping is a no-op, so the server counts
 * one session per device per day.
 */
export async function recordVisitAndReport(
  now: Date = new Date(),
  fetchImpl: typeof fetch = fetch
): Promise<VisitOutcome> {
  if (typeof window === "undefined") {
    return { isFirstVisitToday: false, isReturning: false, reported: false };
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    const storage = browserStorage();
    const today = toDayKey(now);
    const record = recordVisitDay(readDays(storage), today);
    // Persisted before the request: if the page closes mid-flight the day stays
    // pending, so the next load picks it up.
    writeDays(storage, record.days);

    const outcome: VisitOutcome = {
      isFirstVisitToday: record.isFirstVisitToday,
      isReturning: record.isReturning,
      reported: false,
    };

    // Already confirmed on an earlier load: nothing to send.
    if (!record.needsReport) return { ...outcome, reported: true };

    const accepted = await reportSession(record.isReturning, fetchImpl);
    if (accepted) {
      writeDays(storage, markReported(record.days, today));
      return { ...outcome, reported: true };
    }

    return outcome;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
