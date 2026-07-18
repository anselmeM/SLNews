import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString,
  max: isProduction ? 20 : 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  // Enable ssl in production if DATABASE_URL does not already include ?sslmode=require
  ...(isProduction && !connectionString.includes("sslmode")
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
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
