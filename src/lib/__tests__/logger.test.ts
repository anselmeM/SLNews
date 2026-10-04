/* eslint-disable no-console -- this suite asserts what the logger writes to the console */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // `isProduction` is read once at module load, so each case has to import a
  // fresh copy of the module after the environment is set.
  const load = async () => (await import("@/lib/logger")).logger;

  describe("outside production", () => {
    it("prefixes the level and passes metadata through", async () => {
      const logger = await load();

      logger.info("hello", { a: 1 });

      expect(console.log).toHaveBeenCalledWith("[INFO]", "hello", { a: 1 });
    });

    it("omits the metadata argument when there is none", async () => {
      const logger = await load();

      logger.warn("bare");

      expect(console.log).toHaveBeenCalledWith("[WARN]", "bare");
    });

    it("omits the metadata argument when it is an empty object", async () => {
      const logger = await load();

      logger.debug("empty", {});

      expect(console.log).toHaveBeenCalledWith("[DEBUG]", "empty");
    });

    it("routes error to console.error, not console.log", async () => {
      const logger = await load();

      logger.error("bad");

      expect(console.error).toHaveBeenCalledWith("[ERROR]", "bad");
      expect(console.log).not.toHaveBeenCalled();
    });

    it("exposes all four levels", async () => {
      const logger = await load();

      logger.debug("d");
      logger.info("i");
      logger.warn("w");
      logger.error("e");

      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe("in production", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
    });

    it("emits a single JSON line with timestamp, level and message", async () => {
      const logger = await load();

      logger.info("prod message", { a: 1 });

      const line = vi.mocked(console.log).mock.calls[0]?.[0];
      expect(typeof line).toBe("string");
      const entry = JSON.parse(line as string);
      expect(entry).toMatchObject({ level: "info", message: "prod message", a: 1 });
      expect(Date.parse(entry.timestamp)).not.toBeNaN();
    });

    it("still routes error to console.error", async () => {
      const logger = await load();

      logger.error("prod error");

      expect(console.error).toHaveBeenCalledTimes(1);
      const entry = JSON.parse(vi.mocked(console.error).mock.calls[0]?.[0] as string);
      expect(entry).toMatchObject({ level: "error", message: "prod error" });
    });
  });
});
