import { logger } from "@/lib/logger";

export function reportError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error(message, { ...context, stack });
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
