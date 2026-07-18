import { db } from "@/lib/db";

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  key: string,
  { maxRequests, windowMs }: RateLimiterOptions
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  bucket.count++;

  if (bucket.count > maxRequests) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: maxRequests - bucket.count, retryAfter: 0 };
}

export async function checkDbRateLimit(
  key: string,
  { maxRequests, windowMs }: RateLimiterOptions
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  try {
    const existing = await db.rateLimit.findUnique({ where: { key } });

    if (!existing || now > existing.expiresAt) {
      await db.rateLimit.upsert({
        where: { key },
        update: { count: 1, expiresAt },
        create: { key, count: 1, expiresAt },
      });
      return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
    }

    if (existing.count >= maxRequests) {
      const retryAfter = Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { allowed: true, remaining: maxRequests - existing.count - 1, retryAfter: 0 };
  } catch {
    return checkRateLimit(key, { maxRequests, windowMs });
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
