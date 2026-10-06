/**
 * Return-rate plumbing, pure half.
 *
 * A habit loop is judged by whether the reader comes back, and until now there
 * was nothing to measure: `/api/analytics` logged a pageview and stored
 * nothing. This module answers "has this device been here before?" **on the
 * device**, so the only thing that leaves it is one boolean per day — no
 * identifier, no cookie, and no way for the server to link two visits.
 *
 * The metric this feeds is deliberately weak and honest: the share of daily
 * sessions from devices that had already visited on an earlier day. It cannot
 * tell you *who* returned, only roughly how many sessions are returns. That is
 * the trade the privacy policy's data-minimisation claim requires.
 */

/** Day keys are `YYYY-MM-DD` in UTC, so a visit cannot split across a timezone. */
export const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * How many past days the device remembers. A returning device only needs to
 * know whether it has *any* earlier day, so this cap costs nothing and keeps
 * the local record bounded.
 */
export const VISIT_DAYS_LIMIT = 60;

/**
 * One local day, and whether the server has confirmed it.
 *
 * `reported` exists because a ping can fail — flaky mobile data, a 5xx, a rate
 * limit — and a day that silently goes unrecorded understates returns exactly
 * for the readers with the worst connectivity. An unreported *current* day is
 * retried on the next load; see `recordVisitAndReport` in retention-client.ts.
 */
export type VisitDay = {
  day: string;
  reported: boolean;
};

export type LocalVisitLog = {
  /** UTC day keys, oldest first, at most `VISIT_DAYS_LIMIT`. */
  days: VisitDay[];
};

export type VisitRecord = {
  days: VisitDay[];
  /** False when this device had already recorded today. */
  isFirstVisitToday: boolean;
  /** True when the device has a visit recorded on an earlier day. */
  isReturning: boolean;
  /** True when today is still unconfirmed and should be sent. */
  needsReport: boolean;
};

/** What a page load learned — and whether today's session is now confirmed. */
export type VisitOutcome = {
  isFirstVisitToday: boolean;
  isReturning: boolean;
  /**
   * True when the server has accepted today's session, whether just now or on
   * an earlier load. False means the day is still pending and will be retried.
   */
  reported: boolean;
};

export function toDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function toVisitDay(entry: unknown): VisitDay | null {
  if (typeof entry === "string") {
    // Legacy shape, written before `reported` existed. Assume the ping landed:
    // it cannot be confirmed either way, and re-sending it would double-count a
    // session or file it under the wrong day.
    return DAY_KEY_PATTERN.test(entry) ? { day: entry, reported: true } : null;
  }

  if (entry && typeof entry === "object") {
    const { day, reported } = entry as { day?: unknown; reported?: unknown };
    if (typeof day !== "string" || !DAY_KEY_PATTERN.test(day)) return null;
    return { day, reported: reported !== false };
  }

  return null;
}

/**
 * Parses the persisted visit log, dropping anything malformed. A log written by
 * an older or corrupted client must never break the app, and a day key that is
 * not a plain date is not something the metric can use.
 */
export function parseVisitDays(raw: string | null | undefined): VisitDay[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const entries = Array.isArray(parsed)
    ? parsed
    : (parsed as LocalVisitLog | null)?.days;

  if (!Array.isArray(entries)) return [];

  const byDay = new Map<string, VisitDay>();
  for (const entry of entries) {
    const visit = toVisitDay(entry);
    if (!visit) continue;
    const existing = byDay.get(visit.day);
    if (!existing) {
      byDay.set(visit.day, visit);
    } else {
      // A duplicated day counts as reported if either copy was.
      existing.reported = existing.reported || visit.reported;
    }
  }

  return [...byDay.values()].slice(-VISIT_DAYS_LIMIT);
}

/**
 * Records today's visit against the days already logged. Returning means "has
 * been here on an earlier day" — no streak, no consecutive-day requirement.
 */
export function recordVisitDay(
  loggedDays: readonly VisitDay[],
  today: string
): VisitRecord {
  const days = loggedDays.map((visit) => ({ ...visit }));
  const isFirstVisitToday = !days.some((visit) => visit.day === today);

  if (isFirstVisitToday) days.push({ day: today, reported: false });

  // An older day can no longer be sent: the endpoint stamps its own UTC day, so
  // a late retry would be counted today instead. Abandon it rather than leave it
  // looking pending forever.
  for (const visit of days) {
    if (visit.day < today) visit.reported = true;
  }

  return {
    days: days.slice(-VISIT_DAYS_LIMIT),
    isFirstVisitToday,
    isReturning: days.some((visit) => visit.day < today),
    needsReport: days.some((visit) => visit.day === today && !visit.reported),
  };
}

/** Marks a day as confirmed once the server has accepted its ping. */
export function markReported(days: readonly VisitDay[], day: string): VisitDay[] {
  return days.map((visit) =>
    visit.day === day ? { ...visit, reported: true } : visit
  );
}

/** The share of a day's sessions that are returns; `null` when there were none. */
export function returningShare(firstVisits: number, returningVisits: number): number | null {
  const total = firstVisits + returningVisits;
  if (total <= 0) return null;
  return returningVisits / total;
}
