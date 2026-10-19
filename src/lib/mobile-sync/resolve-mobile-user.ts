/**
 * Resolving the sync caller to a Postgres `User.id`.
 *
 * Two callers reach these routes: the Flutter app, which has no cookies and
 * sends `Authorization: Bearer <clerk session JWT>`, and web-originated calls on
 * a cookie session. Both end up in the same place — the Clerk user id, with the
 * `User` row ensured to exist, because a reader can install the app, sign in and
 * sync before ever opening the website.
 */
import { verifyToken } from "@clerk/backend";
import { auth as cookieAuth, currentUser } from "@clerk/nextjs/server";
import { isOwnerOrAdminEmail } from "@/lib/auth-callbacks";
import { db } from "@/lib/db";

export interface MobileUser {
  /** `User.id` in Postgres — which is the Clerk user id for new rows. */
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: "USER" | "WRITER" | "EDITOR" | "ADMIN";
}

interface Identity {
  /** Clerk user id (`user_…`). */
  clerkUserId: string;
  email: string | null;
  name: string;
  image: string | null;
}

const BEARER_PREFIX = "bearer ";
const CLERK_API_BASE = "https://api.clerk.com/v1";
/** A slow Clerk response must never hold the sync route open. */
const CLERK_PROFILE_TIMEOUT_MS = 3_500;
/**
 * The literal this resolver stores when it has no usable name. It is also the
 * marker the backfill treats as "unset": a row carrying it may be updated from
 * Clerk, while any other stored name is a value the reader (or the web app) set.
 */
const FALLBACK_NAME = "SLNews User";

/**
 * Extracts the token from an `Authorization` header. A bare token (no scheme) is
 * accepted too: some clients send the JWT unwrapped, and rejecting it would be a
 * gratuitous 401 — but any other scheme (`Basic`, `Negotiate`) is not a session
 * token, so it is treated as "no bearer" and falls back to the cookie session.
 */
export function readBearerToken(
  header: string | null | undefined
): string | null {
  if (!header) return null;
  const value = header.trim();
  if (value.length === 0) return null;
  const lower = value.toLowerCase();
  if (lower === "bearer") return null;
  if (lower.startsWith(BEARER_PREFIX)) {
    const token = value.slice(BEARER_PREFIX.length).trim();
    return token.length > 0 ? token : null;
  }
  return value.includes(" ") ? null : value;
}

function authorizedParties(): string[] | undefined {
  const raw = process.env.CLERK_AUTHORIZED_PARTIES;
  if (!raw) return undefined;
  const parties = raw
    .split(",")
    .map((party) => party.trim())
    .filter(Boolean);
  return parties.length > 0 ? parties : undefined;
}

function clerkUserIdFromClaims(
  payload: Record<string, unknown>
): string | null {
  const candidates = [payload.sub, payload.userId, payload.user_id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  return null;
}

function displayName(payload: Record<string, unknown>): string {
  const given =
    typeof payload.given_name === "string" ? payload.given_name : "";
  const family =
    typeof payload.family_name === "string" ? payload.family_name : "";
  const full = [given, family].filter(Boolean).join(" ");
  if (full) return full;
  if (typeof payload.name === "string" && payload.name) return payload.name;
  if (typeof payload.username === "string" && payload.username)
    return payload.username;
  return FALLBACK_NAME;
}

function primaryEmail(payload: Record<string, unknown>): string | null {
  if (typeof payload.email === "string" && payload.email.includes("@"))
    return payload.email;
  if (
    typeof payload.email_address === "string" &&
    payload.email_address.includes("@")
  ) {
    return payload.email_address;
  }
  return null;
}

function hasRealEmail(email: string | null | undefined): boolean {
  return typeof email === "string" && email.trim().length > 0;
}

/** `null`, `""` and the literal fallback all mean "the reader has no name yet". */
function isUsableName(name: string | null | undefined): boolean {
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.trim() !== FALLBACK_NAME
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

/** `primary_email_address_id`, else the first address Clerk returns. */
function profileEmail(payload: Record<string, unknown>): string | null {
  const addresses = Array.isArray(payload.email_addresses)
    ? payload.email_addresses
        .map(asRecord)
        .filter((entry): entry is Record<string, unknown> => !!entry)
    : [];
  const primaryId =
    typeof payload.primary_email_address_id === "string"
      ? payload.primary_email_address_id
      : null;
  const preferred = primaryId
    ? addresses.find((entry) => entry.id === primaryId)
    : undefined;
  const chosen = preferred ?? addresses[0];
  return typeof chosen?.email_address === "string"
    ? chosen.email_address
    : null;
}

/** `first_name` + `last_name`, else `username`, else nothing usable. */
function profileName(payload: Record<string, unknown>): string | null {
  const given =
    typeof payload.first_name === "string" ? payload.first_name.trim() : "";
  const family =
    typeof payload.last_name === "string" ? payload.last_name.trim() : "";
  const full = [given, family].filter(Boolean).join(" ");
  if (full) return full;
  const username =
    typeof payload.username === "string" ? payload.username.trim() : "";
  return username || null;
}

interface ClerkProfile {
  email: string | null;
  name: string | null;
}

/**
 * One `GET /v1/users/{sub}` for a token whose claims carry no email or name.
 *
 * Mobile session tokens are deliberately thin — Clerk trusts them for `sub` and
 * not much else — so the claims alone cannot fill the `User` row. This is the
 * only place that reads the Backend API for identity, and it is fail-open: a
 * missing secret, a timeout, a non-2xx answer or unparseable JSON all return
 * `null`, and the caller keeps the claims. Sync must never fail because this
 * enrichment failed.
 *
 * The warning is non-secret on purpose: no token, no URL containing the key,
 * no response body — just the failure class.
 */
async function fetchClerkProfile(
  clerkUserId: string
): Promise<ClerkProfile | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn(
      "mobile-sync: CLERK_SECRET_KEY is unset; keeping the thin token claims"
    );
    return null;
  }

  try {
    const response = await fetch(
      `${CLERK_API_BASE}/users/${encodeURIComponent(clerkUserId)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        signal: AbortSignal.timeout(CLERK_PROFILE_TIMEOUT_MS),
      }
    );
    if (!response.ok) {
      console.warn(
        `mobile-sync: Clerk user lookup answered ${response.status}; keeping the thin token claims`
      );
      return null;
    }

    const payload = asRecord(await response.json());
    if (!payload) return null;
    return { email: profileEmail(payload), name: profileName(payload) };
  } catch (error) {
    const reason = error instanceof Error ? error.name : "unknown error";
    console.warn(
      `mobile-sync: Clerk user lookup failed (${reason}); keeping the thin token claims`
    );
    return null;
  }
}

/**
 * Enriches a claim-derived identity only when it is thin AND the stored row has
 * no address yet. The second half is the idempotency guard: the first sync that
 * succeeds backfills a real email, so every later thin token skips the API call
 * instead of paying for a lookup on every request (and instead of retrying
 * forever for a Clerk user who simply has no display name).
 */
async function resolveStoredIdentity(
  identity: Identity,
  storedEmail: string | null
): Promise<Identity> {
  if (hasRealEmail(identity.email) && isUsableName(identity.name))
    return identity;
  if (hasRealEmail(storedEmail)) return identity;

  const profile = await fetchClerkProfile(identity.clerkUserId);
  if (!profile) return identity;

  return {
    ...identity,
    email: profile.email ?? identity.email,
    name: profile.name ?? identity.name,
  };
}

interface StoredUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string;
}

/**
 * The only fields this resolver may write: an email that is missing and a name
 * that is missing or still the fallback. A name a reader chose on the web is
 * never replaced by a token claim or a Clerk profile.
 */
function identityBackfill(
  row: Pick<StoredUser, "email" | "name">,
  identity: Identity
): { email?: string; name?: string; image?: string } {
  const data: { email?: string; name?: string; image?: string } = {};
  const email = normalizeEmail(identity.email);
  if (email && !hasRealEmail(row.email)) data.email = email;
  if (isUsableName(identity.name) && !isUsableName(row.name))
    data.name = identity.name;
  return data;
}

async function backfillStoredUser(
  id: string,
  data: { email?: string; name?: string; image?: string }
): Promise<StoredUser | null> {
  try {
    return await db.user.update({ where: { id }, data });
  } catch {
    // A unique-email collision (the address already belongs to another row) must
    // not turn a valid sync into a 401: keep the row as it was.
    console.warn(
      "mobile-sync: could not backfill the stored User row; keeping it as is"
    );
    return null;
  }
}

/**
 * Verifies a bearer session token. Every failure — malformed JWT, bad signature,
 * expired, wrong authorized party, missing secret — is a `null`, never a throw:
 * an unverifiable token means "not signed in", which the route answers with 401.
 *
 * `@clerk/backend` v3 **resolves with the claims and throws on failure** (the
 * older `{ data, errors }` result shape was removed). Verified against the
 * installed 3.17.1: a malformed token throws `_TokenVerificationError` with
 * `reason: 'token-invalid'`. Reading `.data` off the result — as this did before
 * the browser-free end-to-end check caught it — makes every valid token look
 * unverifiable and 401s every sync call.
 */
export async function resolveBearerIdentity(
  token: string
): Promise<Identity | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  try {
    const parties = authorizedParties();
    const claims = (await verifyToken(token, {
      secretKey,
      ...(parties ? { authorizedParties: parties } : {}),
    })) as unknown as Record<string, unknown>;

    const clerkUserId = clerkUserIdFromClaims(claims);
    if (!clerkUserId) return null;

    return {
      clerkUserId,
      email: primaryEmail(claims),
      name: displayName(claims),
      image: typeof claims.picture === "string" ? claims.picture : null,
    };
  } catch {
    return null;
  }
}

/**
 * The cookie-session half of the mobile contract.
 *
 * `currentUser()` is preferred because it carries the profile fields needed to
 * create a `User` row on first sync, and because it is the same call the rest of
 * the app's `auth()` bridge already pays for. When it is unavailable — an
 * OAuth-only account with no email, for instance — the session id alone is
 * enough: the row is looked up by id, and only a brand-new user with no email
 * needs the extra fields.
 */
export async function resolveSessionIdentity(): Promise<Identity | null> {
  try {
    const user = await currentUser();
    if (user) {
      const email =
        user.emailAddresses.find(
          (entry) => entry.id === user.primaryEmailAddressId
        )?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        null;
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        FALLBACK_NAME;
      return {
        clerkUserId: user.id,
        email,
        name,
        image: user.imageUrl || null,
      };
    }

    const session = await cookieAuth();
    if (!session.userId) return null;
    return {
      clerkUserId: session.userId,
      email: null,
      name: FALLBACK_NAME,
      image: null,
    };
  } catch {
    return null;
  }
}

function normalizeEmail(email: string | null): string | null {
  const trimmed = email?.toLowerCase().trim();
  return trimmed ? trimmed : null;
}

/**
 * Finds or creates the Postgres row for a Clerk identity.
 *
 * The email branch matters: a reader whose account predates this Clerk project
 * (Auth.js era) has a cuid `User.id` and a unique email. Creating a row keyed by
 * the Clerk id would violate `User.email @unique`, so the existing row is reused
 * and the sync rows hang off its id.
 *
 * A thin identity (no email, or only the `"SLNews User"` placeholder name) is
 * enriched from the Clerk Backend API once, but only while the stored row has no
 * real email — see `resolveStoredIdentity`. Everything here is fail-open: a
 * failed lookup still creates/updates the row from the claims.
 */
export async function ensureMobileUser(
  identity: Identity
): Promise<MobileUser | null> {
  try {
    const byId = await db.user.findUnique({
      where: { id: identity.clerkUserId },
    });
    if (byId) {
      const resolved = await resolveStoredIdentity(identity, byId.email);
      const data = identityBackfill(byId, resolved);
      if (Object.keys(data).length === 0) return toMobileUser(byId, resolved);

      const updated = await backfillStoredUser(byId.id, data);
      return toMobileUser(updated ?? byId, resolved);
    }

    const resolved = await resolveStoredIdentity(identity, null);
    const email = normalizeEmail(resolved.email);

    if (email) {
      const byEmail = await db.user.findUnique({ where: { email } });
      if (byEmail) {
        const data = identityBackfill(byEmail, resolved);
        if (resolved.image) data.image = resolved.image;
        const updated =
          Object.keys(data).length > 0
            ? await backfillStoredUser(byEmail.id, data)
            : null;
        return toMobileUser(updated ?? byEmail, resolved);
      }
    }

    // Same naming/role conventions as `src/auth.ts`: the owner whitelist decides
    // ADMIN, everyone else is USER.
    const isAdmin = isOwnerOrAdminEmail(email);
    const created = await db.user.create({
      data: {
        id: identity.clerkUserId,
        email,
        name: resolved.name,
        image: resolved.image,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });
    return toMobileUser(created, resolved);
  } catch {
    return null;
  }
}

function toMobileUser(
  row: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: string;
  },
  identity: Identity
): MobileUser {
  const isAdmin = isOwnerOrAdminEmail(row.email ?? identity.email);
  // `src/auth.ts` refuses to hand out ADMIN to anyone off the whitelist, even if
  // the stored row says otherwise; keep that rule here.
  const role =
    row.role === "ADMIN" && !isAdmin
      ? "EDITOR"
      : (row.role as MobileUser["role"]);
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? identity.name,
    image: row.image,
    role: isAdmin ? "ADMIN" : role,
  };
}

/**
 * Resolves a request to a Postgres user id: bearer token first, cookie session
 * second. Returns `null` when neither yields a user — an unverifiable token never
 * throws, so the route can answer 401 without a try/catch of its own.
 *
 * A `Bearer` header wins even when the token is invalid: a client that sent a
 * token believes it is that user, so falling back to the cookie session would
 * silently answer as somebody else. Only an absent (or non-bearer) header falls
 * back.
 */
export async function resolveMobileUser(
  headers: Headers
): Promise<MobileUser | null> {
  const header = headers.get("authorization");
  if (isBearerHeader(header)) {
    const token = readBearerToken(header);
    if (!token) return null;
    const identity = await resolveBearerIdentity(token);
    return identity ? ensureMobileUser(identity) : null;
  }

  const identity = await resolveSessionIdentity();
  return identity ? ensureMobileUser(identity) : null;
}

/**
 * `Bearer` with an empty token is still the bearer path — it must be a 401, not
 * a cookie fallback — so the route can tell "no header" from "bad header".
 */
export function isBearerHeader(header: string | null | undefined): boolean {
  if (typeof header !== "string") return false;
  const lower = header.trim().toLowerCase();
  return lower === BEARER_PREFIX.trim() || lower.startsWith(BEARER_PREFIX);
}
