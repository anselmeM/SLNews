import * as Sentry from "@sentry/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportError, withErrorLogging } from "@/lib/error-reporting";
import { logger } from "@/lib/logger";

// Mocked so this test asserts the intent (does it reach Sentry, with what
// context?) rather than the SDK's behaviour — and so it does not pay the ~2s
// cost of loading the real `@sentry/nextjs` in this project.
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

describe("reportError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the error to Sentry with the context as extra", () => {
    const error = new Error("boom");
    reportError(error, { where: "auth()" });

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: { where: "auth()" },
    });
  });

  it("still logs locally with a stack, so it works when Sentry is off", () => {
    const error = new Error("boom");
    reportError(error, { where: "api/upload" });

    expect(logger.error).toHaveBeenCalledTimes(1);
    const [message, meta] = vi.mocked(logger.error).mock.calls[0]!;
    expect(message).toBe("boom");
    expect(meta).toMatchObject({ where: "api/upload" });
    expect(meta).toHaveProperty("stack");
  });

  it("handles a non-Error throwable", () => {
    reportError("just a string");

    expect(logger.error).toHaveBeenCalledWith("just a string", expect.objectContaining({}));
    expect(Sentry.captureException).toHaveBeenCalledWith("just a string", { extra: undefined });
  });
});

describe("withErrorLogging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports a rejection and rethrows it", async () => {
    const error = new Error("async boom");
    const wrapped = withErrorLogging(async () => {
      throw error;
    }, "loadThing");

    await expect(wrapped()).rejects.toBe(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: { function: "loadThing" },
    });
  });

  it("reports a synchronous throw and rethrows it", () => {
    const error = new Error("sync boom");
    const wrapped = withErrorLogging(() => {
      throw error;
    }, "syncThing");

    expect(() => wrapped()).toThrow(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: { function: "syncThing" },
    });
  });

  it("passes a successful result through untouched", () => {
    // `withErrorLogging` constrains to `(...args: unknown[]) => unknown`, so a
    // typed function has to be expressed that way.
    const double = (...args: unknown[]) => (args[0] as number) * 2;
    const wrapped = withErrorLogging(double, "double");

    expect(wrapped(21)).toBe(42);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
