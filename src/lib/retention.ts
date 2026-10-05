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

export type LocalVisitLog = {
  /** UTC day keys, oldest first, at most `VISIT_DAYS_LIMIT`. */
  days: string[];
};

export type VisitRecord = {
  days: string[];
  /** False when this device had already recorded today (nothing to report). */
  isFirstVisitToday: boolean;
  /** True when the device has a visit recorded on an earlier day. */
  isReturning: boolean;
};

export function toDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Parses the persisted visit log, dropping anything malformed. A log written by
 * an older or corrupted client must never break the app, and a day key that is
 * not a plain date is not something the metric can use.
 */
export function parseVisitDays(raw: string | null | undefined): string[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const days = Array.isArray(parsed)
    ? parsed
    : (parsed as LocalVisitLog | null)?.days;

  if (!Array.isArray(days)) return [];

  const valid: string[] = [];
  for (const day of days) {
    if (typeof day === "string" && DAY_KEY_PATTERN.test(day) && !valid.includes(day)) {
      valid.push(day);
    }
  }
  return valid.slice(-VISIT_DAYS_LIMIT);
}

/**
 * Records today's visit against the days already logged. Returning means "has
 * been here on an earlier day" — no streak, no consecutive-day requirement.
 */
export function recordVisitDay(
  loggedDays: readonly string[],
  today: string
): VisitRecord {
  const days = [...loggedDays];
  const isFirstVisitToday = !days.includes(today);

  if (isFirstVisitToday) days.push(today);

  return {
    days: days.slice(-VISIT_DAYS_LIMIT),
    isFirstVisitToday,
    isReturning: days.some((day) => day < today),
  };
}

/** The share of a day's sessions that are returns; `null` when there were none. */
export function returningShare(firstVisits: number, returningVisits: number): number | null {
  const total = firstVisits + returningVisits;
  if (total <= 0) return null;
  return returningVisits / total;
}
