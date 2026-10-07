import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { resolvePgConnection } from '@/lib/db-ssl';
import { logger } from '@/lib/logger';

const connectionString = `${process.env.DATABASE_URL}`;

const isProduction = process.env.NODE_ENV === "production";

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

const resolved = resolvePgConnection(connectionString);

// When the URL says nothing about TLS we have to choose, and the two
// environments want opposite things: local Postgres on 127.0.0.1 (see
// `.env`, which says `sslmode=disable`) has no certificate to verify, while a
// hosted database should never be reached unverified. `rejectUnauthorized:
// false` keeps a hosted database working but gives up verification, so it is
// logged rather than silent — the fix is to spell out `sslmode=verify-full`.
const fallbackSsl = resolved.unset && isProduction ? { rejectUnauthorized: false } : undefined;
const ssl = resolved.ssl === undefined ? fallbackSsl : resolved.ssl;

// Any TLS configuration that does not verify the certificate is worth saying out
// loud, whether it came from the fallback above or from an explicit
// `sslmode=no-verify`. `ssl === false` is the honest "no TLS at all" of local
// development, and is not warned about.
if (typeof ssl === "object" && ssl.rejectUnauthorized === false) {
  logger.warn(
    resolved.unset
      ? "DATABASE_URL has no sslmode: connecting without certificate verification. Set sslmode=verify-full."
      : `DATABASE_URL sets sslmode=${resolved.mode}: connecting without certificate verification.`,
  );
}

const pool =
  global.pgPool ||
  new Pool({
    connectionString: resolved.connectionString,
    max: Number(process.env.PG_POOL_MAX) || (isProduction ? 5 : 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    ...(ssl === undefined ? {} : { ssl }),
  });

pool.on("error", (err) => {
  // Deliberately `logger`, not `reportError`: `db.ts` sits in the module graph of
  // many tests and services, and it does not need the Sentry SDK pulled in.
  logger.error("pg pool unexpected error", { error: err.message });
});

// No query-level retry here on purpose.
//
// A `withRetry` helper used to live at this spot, intended for Neon cold-start
// connection timeouts. It was never called by anything, and wiring it in as
// written would have made things worse rather than better:
//
//   `connectionTimeoutMillis` is 10_000 and the helper retried 3 times with a
//   `500ms * (i + 1)` backoff, so a cold-start failure could block for
//   10s + 0.5s + 10s + 1s + 10s = ~31.5s. On Vercel that risks the function
//   timeout while holding concurrency — worse for the reader than failing fast.
//   And since a timeout is ambiguous, retrying a write can double-apply it.
//
// Cold starts are handled at the infrastructure level instead:
// `.github/workflows/keep-warm.yml` pings `/api/health` every 5 minutes so the
// Neon compute and the serverless function stay warm (a cold first request to
// `/` was measured at ~6s TTFB).
//
// If retry is ever wanted, retry reads only and budget the added latency against
// the function timeout — do not reuse the numbers above.

const adapter = new PrismaPg(pool);

export const db =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
  global.pgPool = pool;
}
