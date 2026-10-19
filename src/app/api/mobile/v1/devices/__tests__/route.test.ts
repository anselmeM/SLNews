import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, POST } from "../route";
import { db } from "@/lib/db";
import { resolveMobileUser } from "@/lib/mobile-sync/resolve-mobile-user";
import { checkDbRateLimit } from "@/lib/rate-limiter";

vi.mock("@/lib/db", () => ({
  db: { mobileDevice: { upsert: vi.fn(), deleteMany: vi.fn() } },
}));

vi.mock("@/lib/mobile-sync/resolve-mobile-user", () => ({
  resolveMobileUser: vi.fn(),
}));

vi.mock("@/lib/rate-limiter", () => ({
  checkDbRateLimit: vi.fn(),
  getClientIp: vi.fn(() => "203.0.113.7"),
}));

vi.mock("@/lib/error-reporting", () => ({ reportError: vi.fn() }));

const TOKEN = "fcm-token-abcdefghijklmnopqrstuvwxyz-0123456789";

function request(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/mobile/v1/devices", {
    method,
    headers: {
      authorization: "Bearer session.jwt",
      "content-type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function signedIn(): void {
  vi.mocked(resolveMobileUser).mockResolvedValue({
    id: "user-1",
    email: "reader@example.com",
    name: "Reader",
    image: null,
    role: "USER",
  });
  vi.mocked(checkDbRateLimit).mockResolvedValue({
    allowed: true,
    retryAfter: 0,
  } as never);
}

describe("/api/mobile/v1/devices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.mobileDevice.upsert).mockResolvedValue({} as never);
    vi.mocked(db.mobileDevice.deleteMany).mockResolvedValue({
      count: 1,
    } as never);
  });

  it("rejects an unauthenticated registration", async () => {
    vi.mocked(resolveMobileUser).mockResolvedValue(null);
    const response = await POST(
      request("POST", { token: TOKEN, platform: "android" })
    );
    expect(response.status).toBe(401);
    expect(db.mobileDevice.upsert).not.toHaveBeenCalled();
  });

  it("upserts the caller's token idempotently", async () => {
    signedIn();
    const response = await POST(
      request("POST", { token: TOKEN, platform: "ios" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(db.mobileDevice.upsert).toHaveBeenCalledWith({
      where: { token: TOKEN },
      update: {
        userId: "user-1",
        platform: "ios",
        lastSeenAt: expect.any(Date),
      },
      create: { userId: "user-1", token: TOKEN, platform: "ios" },
    });
  });

  it("defaults the platform to android for older clients", async () => {
    signedIn();
    await POST(request("POST", { token: TOKEN }));
    expect(db.mobileDevice.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ platform: "android" }),
      })
    );
  });

  it("rejects a token that is not a token and an unknown platform", async () => {
    signedIn();

    const short = await POST(request("POST", { token: "abc" }));
    expect(short.status).toBe(400);

    const weird = await POST(request("POST", { token: `${TOKEN} !!!` }));
    expect(weird.status).toBe(400);

    const platform = await POST(
      request("POST", { token: TOKEN, platform: "windows-phone" })
    );
    expect(platform.status).toBe(400);

    const noBody = await POST(request("POST"));
    expect(noBody.status).toBe(400);
    expect(db.mobileDevice.upsert).not.toHaveBeenCalled();
  });

  it("rate-limits a caller who registers in a loop", async () => {
    signedIn();
    vi.mocked(checkDbRateLimit).mockResolvedValue({
      allowed: false,
      retryAfter: 12,
    } as never);

    const response = await POST(
      request("POST", { token: TOKEN, platform: "android" })
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("12");
    expect(db.mobileDevice.upsert).not.toHaveBeenCalled();
  });

  it("unregisters only the caller's own token", async () => {
    signedIn();
    const response = await DELETE(request("DELETE", { token: TOKEN }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, removed: 1 });
    expect(db.mobileDevice.deleteMany).toHaveBeenCalledWith({
      where: { token: TOKEN, userId: "user-1" },
    });
  });

  it("requires authentication to unregister too", async () => {
    vi.mocked(resolveMobileUser).mockResolvedValue(null);
    const response = await DELETE(request("DELETE", { token: TOKEN }));
    expect(response.status).toBe(401);
    expect(db.mobileDevice.deleteMany).not.toHaveBeenCalled();
  });
});
