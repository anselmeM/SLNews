/**
 * Applies the additive mobile-sync schema before a deployment builds.
 *
 * Why this exists: these three tables are additive to a schema with no Prisma
 * migration history, so nothing applied them to the deployed database. The sync
 * route therefore answered 500 — "The table public.MobileBookmark does not exist
 * in the current database" — while working perfectly against a developer's local
 * Postgres, and the failure was invisible until a request hit it.
 *
 * Vercel runs this through the `vercel-build` script, so whichever database a
 * deployment actually talks to receives the objects it needs. The file it
 * executes is guarded statement by statement, so this is safe on every deploy
 * and a no-op against an already-migrated database.
 *
 * Reads DATABASE_URL from the environment and prints the host only.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import 'dotenv/config';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(here, '..', 'docs', 'mobile-sync-migration.sql');

/** Host without credentials, safe to log. */
function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return '(unparseable DATABASE_URL)';
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set, so the sync schema cannot be applied');
  }

  const sql = await readFile(sqlPath, 'utf8');
  const client = new pg.Client({ connectionString: url });

  await client.connect();
  try {
    await client.query(sql);

    // Assert the outcome rather than trusting the statements: a partially
    // migrated database must fail the deploy instead of serving 500s.
    const { rows } = await client.query(
      `SELECT to_regclass('"MobileBookmark"') AS bookmark,
              to_regclass('"MobileReaction"') AS reaction,
              to_regclass('"MobileFollow"') AS follow`
    );
    const missing = Object.entries(rows[0])
      .filter(([, present]) => present === null)
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(`still missing after migration: ${missing.join(', ')}`);
    }

    console.log(
      `mobile sync schema ready on ${hostOf(url)} (bookmark, reaction, follow)`
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`mobile sync schema migration failed: ${error.message}`);
  process.exitCode = 1;
});
