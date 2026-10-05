import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

const MAX_REPORTS_PER_HOUR = 60;
const MAX_BODY_BYTES = 8_192;
const MAX_FIELD_LENGTH = 200;

type CspReport = {
  "effective-directive"?: unknown;
  "violated-directive"?: unknown;
  "blocked-uri"?: unknown;
  "document-uri"?: unknown;
};

function trimmed(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.slice(0, MAX_FIELD_LENGTH);
}

function firstReport(body: unknown): CspReport | null {
  // `report-uri` posts a single report object; `report-to` batches them.
  if (Array.isArray(body)) {
    const first = body[0] as { body?: CspReport } | undefined;
    return (first?.body ?? (first as CspReport | undefined)) ?? null;
  }
  if (body && typeof body === "object") {
    const wrapped = (body as { "csp-report"?: CspReport })["csp-report"];
    if (wrapped && typeof wrapped === "object") return wrapped;
    return body as CspReport;
  }
  return null;
}

/**
 * Collects Content-Security-Policy violation reports.
 *
 * The policy is verified by the e2e suite in a real browser, but a report
 * endpoint is what covers the flows that cannot be reproduced there — a signed-in
 * Clerk session, an ad slot with a live publisher id, an embedded clip on a
 * reader's device. Reports are logged as diagnostics and never stored, and the
 * endpoint is best-effort rate limited (in memory, so no IP address is persisted
 * to protect an endpoint whose whole point is not identifying anyone).
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(`csp:${getClientIp(request)}`, {
    maxRequests: MAX_REPORTS_PER_HOUR,
    windowMs: 3_600_000,
  });
  if (!limit.allowed) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = JSON.parse((await request.text()).slice(0, MAX_BODY_BYTES));
  } catch {
    // Browsers occasionally send an empty body; anything unparseable is noise.
    return new NextResponse(null, { status: 204 });
  }

  const report = firstReport(body);
  if (report) {
    logger.warn("csp violation", {
      directive: trimmed(report["effective-directive"]) ?? trimmed(report["violated-directive"]),
      blocked: trimmed(report["blocked-uri"]),
      document: trimmed(report["document-uri"]),
    });
  }

  return new NextResponse(null, { status: 204 });
}
