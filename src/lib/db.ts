import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString,
  max: isProduction ? 20 : 5,
  idleTimeoutMillis: 60_000,
  connectionTimeoutMillis: 15_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  ...(isProduction && !connectionString.includes("sslmode")
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

pool.on("error", (err) => {
  console.error("pg pool unexpected error:", err.message);
});

// Retry helper for Neon cold-start connection timeouts
export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = (err as Error).message || "";
      if (i === retries - 1 || (!msg.includes("timeout") && !msg.includes("terminated") && !msg.includes("Connection"))) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

const adapter = new PrismaPg(pool);

declare global {
  // allow global `var` declarations
   
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = db;
