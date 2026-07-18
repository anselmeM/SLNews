import { logger } from "./logger";

export function generateErrorId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const errorId = generateErrorId();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error(message, { event: "error", errorId, stack, ...context });
}
