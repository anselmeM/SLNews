import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Cookie holding the derived admin token (never the key itself). */
export const ADMIN_COOKIE = "slnews_admin";

/** True when the server has an admin key configured at all. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.SPONSORSHIP_ADMIN_KEY?.trim());
}

/** Token derived from the configured key; stored in the cookie. */
export function expectedToken(): string {
  const key = process.env.SPONSORSHIP_ADMIN_KEY?.trim() ?? "";
  return createHash("sha256").update(`slnews-admin:${key}`).digest("hex");
}

/** Constant-time comparison of a submitted key with the configured one. */
export function keyMatches(submitted: string): boolean {
  const key = process.env.SPONSORSHIP_ADMIN_KEY?.trim() ?? "";
  if (!key) return false;
  const a = createHash("sha256").update(submitted.trim()).digest();
  const b = createHash("sha256").update(key).digest();
  return timingSafeEqual(a, b);
}

/** Reads the request cookie jar and answers whether this visitor may administer. */
export async function isAdminRequest(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value ?? "";
  if (!token) return false;
  const expected = Buffer.from(expectedToken());
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
