#!/usr/bin/env node
/**
 * Runs one read-only SQL query against the database the schema workflow
 * resolved, and prints the rows.
 *
 * Used by `.github/workflows/db-schema.yml` in `inspect` mode, so the database
 * the app actually talks to can be audited without anyone copying a connection
 * string out of Vercel (production `DATABASE_URL` is marked Sensitive and cannot
 * be read back).
 *
 * The query runs inside a READ ONLY transaction: anything that would write fails
 * with a Postgres error rather than being applied. Output is capped so a query
 * over a large table cannot flood the log.
 */

import { Pool } from "pg";

const MAX_ROWS = 200;
const CONNECT_TIMEOUT_MS = 15_000;

const sql = process.env.INSPECT_SQL;
if (!sql || !sql.trim()) {
  console.error("INSPECT_SQL is required.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ...(/sslmode=disable/.test(connectionString)
    ? {}
    : { ssl: { rejectUnauthorized: false } }),
  connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
});

const client = await pool.connect();
try {
  await client.query("BEGIN TRANSACTION READ ONLY");
  const result = await client.query(sql);
  const rows = result.rows.slice(0, MAX_ROWS);

  console.log(`rows: ${result.rowCount ?? rows.length}${result.rowCount > MAX_ROWS ? ` (showing ${MAX_ROWS})` : ""}`);
  console.log(JSON.stringify(rows, null, 2));

  await client.query("ROLLBACK");
} finally {
  client.release();
  await pool.end();
}
