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
