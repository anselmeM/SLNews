type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const isProduction = process.env.NODE_ENV === "production";

/* eslint-disable no-console -- logger utility */
function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = { timestamp: new Date().toISOString(), level, message, ...meta };
  if (isProduction) {
    console[level === "error" ? "error" : "log"](JSON.stringify(entry));
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    if (meta && Object.keys(meta).length > 0) {
      console[level === "error" ? "error" : "log"](prefix, message, meta);
    } else {
      console[level === "error" ? "error" : "log"](prefix, message);
    }
  }
}
/* eslint-enable no-console */

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
