import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

/**
 * Records an error: a structured local log, plus a Sentry event when Sentry is
 * configured.
 *
 * Both `sentry.server.config.ts` and `instrumentation-client.ts` gate `Sentry.init`
 * on their DSN (`enabled: !!process.env.SENTRY_DSN`), so `captureException` is a
 * no-op — not an error — wherever Sentry is unconfigured (local dev, CI, tests).
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Kept as the always-on record: this is what shows up in Vercel's function
  // logs as JSON, and it works even when Sentry is disabled.
  logger.error(message, { ...context, stack });

  // Sentry groups by stack/type, so passing the context as `extra` keeps it as
  // searchable metadata rather than splitting one bug into many issues.
  Sentry.captureException(error, { extra: context });
}

export function withErrorLogging<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((err) => {
          reportError(err, { function: name });
          throw err;
        });
      }
      return result;
    } catch (err) {
      reportError(err, { function: name });
      throw err;
    }
  }) as T;
}
