import { browserStorage } from "./persist-storage";
import { parseVisitDays, recordVisitDay, toDayKey } from "./retention";

/**
 * Return-rate plumbing, browser half.
 *
 * The visit log lives on the device, so the server never receives an identifier,
 * a cookie, or a history — only one anonymous "was this a return?" boolean per
 * device per day. See `src/lib/retention.ts` for why the metric is shaped that
 * way.
 */

export const VISIT_LOG_KEY = "slnews-visit-days";

export type VisitOutcome = {
  isFirstVisitToday: boolean;
  isReturning: boolean;
};

export function recordLocalVisit(now: Date = new Date()): VisitOutcome {
  if (typeof window === "undefined") {
    // Nothing to record during SSR/prerender, and nothing to report.
    return { isFirstVisitToday: false, isReturning: false };
  }

  const storage = browserStorage();
  const today = toDayKey(now);
  // `StateStorage.getItem` may return a promise; localStorage never does, and a
  // promise here would only mean "no readable log".
  const raw = storage.getItem(VISIT_LOG_KEY);
  const record = recordVisitDay(parseVisitDays(typeof raw === "string" ? raw : null), today);
  storage.setItem(VISIT_LOG_KEY, JSON.stringify({ days: record.days }));

  return { isFirstVisitToday: record.isFirstVisitToday, isReturning: record.isReturning };
}

export async function reportSession(
  isReturning: boolean,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  try {
    await fetchImpl("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "session", returning: isReturning }),
      keepalive: true,
    });
  } catch {
    // Instrumentation only: a failed ping must never surface to the reader.
  }
}

/**
 * Records today's visit and reports it once. A second load on the same day is a
 * no-op, so the server counts one session per device per day.
 */
export async function recordVisitAndReport(
  now: Date = new Date(),
  fetchImpl: typeof fetch = fetch
): Promise<VisitOutcome> {
  const outcome = recordLocalVisit(now);
  if (outcome.isFirstVisitToday) {
    await reportSession(outcome.isReturning, fetchImpl);
  }
  return outcome;
}
