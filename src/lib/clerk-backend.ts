/**
 * Clerk Backend API helpers used outside the request-identity path.
 *
 * The one operation here is account deletion: Play (and the privacy policy) promise
 * that deleting an SLNews account removes the sign-in itself, not just our rows. The
 * lookup used by mobile sync lives in `mobile-sync/resolve-mobile-user.ts` because it
 * is fail-open enrichment; deletion is the opposite — it must fail loudly.
 */

const CLERK_API_BASE = "https://api.clerk.com/v1";
const CLERK_TIMEOUT_MS = 5_000;

export type ClerkDeleteResult =
  /** The identity is gone (or was already gone when we asked). */
  | "deleted"
  /** No CLERK_SECRET_KEY: deletion cannot be honoured in this environment. */
  | "unconfigured"
  /** Clerk answered non-2xx (other than 404) or the request failed. */
  | "failed";

/**
 * Deletes a Clerk user.
 *
 * `404` counts as success: the caller may retry a deletion that already removed the
 * identity, and the retry must not report a failure the reader cannot act on.
 */
export async function deleteClerkUser(
  clerkUserId: string
): Promise<ClerkDeleteResult> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return "unconfigured";

  try {
    const response = await fetch(
      `${CLERK_API_BASE}/users/${encodeURIComponent(clerkUserId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${secretKey}` },
        signal: AbortSignal.timeout(CLERK_TIMEOUT_MS),
      }
    );
    if (response.ok || response.status === 404) return "deleted";
    return "failed";
  } catch {
    return "failed";
  }
}
