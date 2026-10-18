/**
 * End-to-end verification of the mobile sync API against a running PWA.
 *
 * Why this exists: unit tests mock Clerk and Prisma, so nothing proves the route
 * works with a real session token, the real database and the real merge engine.
 * This script mints a Clerk session token for a throwaway probe user through the
 * Clerk Backend API, drives GET/POST /api/mobile/v1/sync, asserts the contract
 * (delta filter, tombstone, stale rejection, idempotency) and then removes every
 * trace: the probe Clerk user and its Postgres row (which cascades to the probe
 * sync rows).
 *
 * Usage:
 *   node scripts/verify-mobile-sync.mjs                     # against http://localhost:3000
 *   node scripts/verify-mobile-sync.mjs --base https://slnews.sl
 *
 * Requires CLERK_SECRET_KEY and DATABASE_URL in .env (never printed).
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const baseIndex = process.argv.indexOf('--base');
const BASE = (baseIndex > -1 ? process.argv[baseIndex + 1] : 'http://localhost:3000').replace(/\/$/, '');
const SYNC = `${BASE}/api/mobile/v1/sync`;
const CLERK_API = 'https://api.clerk.com/v1';
const SECRET = process.env.CLERK_SECRET_KEY;

const failures = [];
let clerkUserId = null;

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
    failures.push(name);
  }
}

async function clerk(path, init = {}) {
  const response = await fetch(`${CLERK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Clerk ${path} -> ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function sync(method, { token, body, query = '' }) {
  const response = await fetch(`${SYNC}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: response.status, body: parsed, retryAfter: response.headers.get('retry-after') };
}

async function main() {
  if (!SECRET) throw new Error('CLERK_SECRET_KEY is not set (.env)');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set (.env)');

  const stamp = Date.now();
  console.log(`Mobile sync E2E against ${SYNC}\n`);

  // --- 0. Probe user + real session token -----------------------------------
  const probeEmail = `mobile-sync-probe+clerk_test+${stamp}@example.com`;
  // The Clerk instance requires a password on Backend-API user creation; this one
  // exists only for the lifetime of the probe and is never logged.
  const probePassword = `Probe-${randomUUID()}-aA1!`;
  const user = await clerk('/users', {
    method: 'POST',
    body: JSON.stringify({
      email_address: [probeEmail],
      password: probePassword,
      first_name: 'Sync',
      last_name: 'Probe',
    }),
  });
  clerkUserId = user.id;
  console.log(`probe user: ${clerkUserId} (${probeEmail})`);

  const session = await clerk('/sessions', {
    method: 'POST',
    body: JSON.stringify({ user_id: clerkUserId }),
  });
  const { jwt: token } = await clerk(`/sessions/${session.id}/tokens`, { method: 'POST', body: '{}' });
  check('minted a real Clerk session token', typeof token === 'string' && token.split('.').length === 3);

  // --- 1. Unauthenticated -----------------------------------------------------
  const anonymous = await sync('GET', { token: 'not-a-token' });
  check('invalid token is rejected with 401', anonymous.status === 401, `got ${anonymous.status}`);

  // --- 2. First sync creates the Postgres user and returns empty state ------
  const first = await sync('GET', { token, query: '' });
  check('signed-in full pull succeeds', first.status === 200, `got ${first.status} ${JSON.stringify(first.body)}`);
  check('fresh account starts empty', (first.body?.bookmarks?.length ?? -1) === 0);

  // --- 3. Push bookmarks / reactions / follows --------------------------------
  const t1 = new Date(stamp - 60_000).toISOString();
  const t2 = new Date(stamp).toISOString();
  const itemId = `slnews-api:probe-${stamp}`;
  const pushed = await sync('POST', {
    token,
    body: {
      bookmarks: [
        {
          itemId,
          title: 'Probe headline',
          sourceUrl: 'https://example.test/probe',
          publisher: 'Probe Press',
          publishedAt: t1,
          savedAt: t1,
          updatedAt: t1,
          deleted: false,
        },
      ],
      reactions: [{ itemId, kind: 'like', updatedAt: t1, deleted: false }],
      follows: [{ targetId: 'team:probe', kind: 'team', label: 'Probe FC', updatedAt: t1, deleted: false }],
    },
  });
  check('push applies the batch', pushed.status === 200 && pushed.body?.applied?.bookmarks === 1, JSON.stringify(pushed.body));
  check('push returns the touched state', (pushed.body?.state?.bookmarks?.length ?? 0) === 1);

  // --- 4. Idempotency ---------------------------------------------------------
  const repeat = await sync('POST', {
    token,
    body: { bookmarks: [{ itemId, title: 'Probe headline', savedAt: t1, updatedAt: t1, deleted: false }] },
  });
  check('re-sending the same row is idempotent (no duplicate)', repeat.status === 200 && (repeat.body?.state?.bookmarks?.length ?? 0) === 1);

  // --- 5. Last-write-wins plus stale rejection -------------------------------
  const newer = await sync('POST', {
    token,
    body: { bookmarks: [{ itemId, title: 'Probe headline v2', savedAt: t2, updatedAt: t2, deleted: false }] },
  });
  const v2 = newer.body?.state?.bookmarks?.[0];
  check('newer updatedAt wins', v2?.title === 'Probe headline v2', JSON.stringify(v2));

  const stale = await sync('POST', {
    token,
    body: { bookmarks: [{ itemId, title: 'Stale attempt', savedAt: t1, updatedAt: t1, deleted: false }] },
  });
  check('older updatedAt is rejected as stale', stale.body?.rejected?.[0]?.reason === 'stale', JSON.stringify(stale.body?.rejected));
  check('stale push did not overwrite the row', stale.body?.state?.bookmarks?.[0]?.title === 'Probe headline v2');

  // --- 6. Tombstones ----------------------------------------------------------
  const deleted = await sync('POST', {
    token,
    body: { bookmarks: [{ itemId, title: 'Probe headline v2', savedAt: t2, updatedAt: new Date(stamp + 60_000).toISOString(), deleted: true }] },
  });
  check('tombstone applies', deleted.body?.state?.bookmarks?.[0]?.deleted === true, JSON.stringify(deleted.body?.state?.bookmarks?.[0]));
  const resurrect = await sync('POST', {
    token,
    body: { bookmarks: [{ itemId, title: 'Resurrect attempt', savedAt: t1, updatedAt: t1, deleted: false }] },
  });
  check('a stale push cannot resurrect a tombstone', resurrect.body?.rejected?.[0]?.reason === 'stale');
  check('row is still deleted', resurrect.body?.state?.bookmarks?.[0]?.deleted === true);

  // --- 7. Delta pull ----------------------------------------------------------
  const delta = await sync('GET', { token, query: `?since=${encodeURIComponent(t2)}` });
  check('delta pull returns rows after `since`', delta.status === 200 && Array.isArray(delta.body?.bookmarks));
  check('delta exposes the tombstone', delta.body?.bookmarks?.every((row) => row.itemId !== itemId || row.deleted === true));

  // --- 8. Validation ----------------------------------------------------------
  const bad = await sync('POST', { token, body: { bookmarks: [{ itemId }] } });
  check('missing required fields -> 400', bad.status === 400, `got ${bad.status}`);
  const tooMany = await sync('POST', {
    token,
    body: { follows: Array.from({ length: 501 }, (_, index) => ({ targetId: `team:t${index}`, kind: 'team', updatedAt: t1 })) },
  });
  check('over the row cap -> 413', tooMany.status === 413, `got ${tooMany.status}`);

  console.log(`\n${failures.length === 0 ? 'ALL CHECKS PASSED' : `${failures.length} CHECK(S) FAILED`}`);
}

/**
 * Deletes the probe's Clerk user and its row in the database this machine can
 * reach. Production is deliberately out of scope: Vercel redacts
 * `DATABASE_URL`, so a run against the deployed app leaves its Postgres row
 * behind — which is why the `cascaded 0 row` line now says so instead of
 * reading like a complete cleanup.
 */
async function cleanup() {
  if (!clerkUserId) return;
  try {
    await clerk(`/users/${clerkUserId}`, { method: 'DELETE' });
    console.log(`cleaned up Clerk probe user ${clerkUserId}`);
  } catch (error) {
    console.log(`WARNING: could not delete Clerk probe user: ${error.message}`);
  }
  try {
    // Delete through the Prisma client that is already connected: shelling out to
    // `npx` is unreliable on Windows and this cascades to the sync rows.
    const deleted = await prisma?.user.deleteMany({ where: { id: clerkUserId } });
    console.log(
      `cleaned up the local probe Postgres user (cascaded ${deleted?.count ?? 0} row); the deployed environment's rows are not reachable from this machine`
    );
  } catch (error) {
    console.log(`WARNING: could not delete the probe Postgres row: ${error.message}`);
  }
}

/**
 * The leftover the local cleanup cannot remove.
 *
 * `User.id` IS the Clerk user id here (see `resolve-mobile-user.ts`), so this
 * statement removes exactly the row the run created in the environment it
 * actually drove. It is printed on every run, pass or fail, because the row
 * exists whenever the first sync reached the server and the operator should not
 * have to infer the id or the SQL from a log line.
 */
function printRemoteCleanup() {
  console.log('\n--- remote cleanup statement --------------------------------------------');
  console.log(`Environment: ${BASE}`);
  if (clerkUserId) {
    console.log('This run created a User row (and its cascade rows) in that environment.');
    console.log('The DATABASE_URL on this machine points elsewhere, so it cannot delete it.');
    console.log("Run this against that environment's database to remove the probe:");
    console.log('');
    console.log(`  DELETE FROM "User" WHERE id = '${clerkUserId}';`);
  } else {
    console.log('No probe user was created, so there is no remote row to clean up.');
  }
  console.log('--------------------------------------------------------------------------');
}

// A Prisma client is created only to prove the tables are reachable; the probe
// asserts through the API, so no direct writes happen here.
const connectionString = process.env.DATABASE_URL;
const prisma = connectionString ? new PrismaClient({ adapter: new PrismaPg({ connectionString }) }) : null;

main()
  .catch((error) => {
    console.error(`ERROR: ${error.message}`);
    failures.push('script error');
  })
  .finally(async () => {
    await cleanup();
    printRemoteCleanup();
    await prisma?.$disconnect().catch(() => {});
    // Set the code rather than calling process.exit(): exiting while keep-alive
    // sockets are still closing trips a libuv assertion on Windows.
    process.exitCode = failures.length === 0 ? 0 : 1;
  });
