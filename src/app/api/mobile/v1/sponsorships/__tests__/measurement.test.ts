import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH as patch, DELETE as remove } from "../[id]/route";
import { POST as events } from "../events/route";
import { GET as report } from "../report/route";
import { db } from "@/lib/db";
import { checkDbRateLimit } from "@/lib/rate-limiter";

vi.mock("@/lib/db", () => ({
  db: { sponsorship: { update: vi.fn(), findMany: vi.fn() } },
}));
vi.mock("@/lib/error-reporting", () => ({ reportError: vi.fn() }));
vi.mock("@/lib/rate-limiter", () => ({
  checkDbRateLimit: vi.fn(),
  getClientIp: vi.fn(() => "203.0.113.1"),
}));

function post(body: unknown): Request {
  return new Request("http://localhost/api/mobile/v1/sponsorships/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function adminRequest(method: string, key?: string): Request {
  return new Request("http://localhost/x", {
    method,
    headers: key ? { "x-admin-key": key } : {},
  });
}

describe("sponsorship measurement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkDbRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 1,
      retryAfter: 0,
    } as never);
    vi.mocked(db.sponsorship.update).mockResolvedValue({ id: "sp_1" } as never);
    vi.mocked(db.sponsorship.findMany).mockResolvedValue([] as never);
  });

  it("counts an impression", async () => {
    const response = await events(post({ id: "sp_1", type: "impression" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, counted: true });
    expect(db.sponsorship.update).toHaveBeenCalledWith({
      where: { id: "sp_1" },
      data: { impressions: { increment: 1 } },
    });
  });

  it("counts a tap and ignores unknown ids", async () => {
    vi.mocked(db.sponsorship.update).mockRejectedValueOnce(
      new Error("not found")
    );
    const response = await events(post({ id: "sp_1", type: "tap" }));
    expect(await response.json()).toEqual({ ok: true, counted: false });
  });

  it("rejects malformed events", async () => {
    expect((await events(post({ type: "impression" }))).status).toBe(400);
    expect((await events(post({ id: "sp_1", type: "click" }))).status).toBe(
      400
    );
  });

  it("protects the report and computes CTR", async () => {
    process.env.SPONSORSHIP_ADMIN_KEY = "secret";
    expect((await report(adminRequest("GET", "wrong"))).status).toBe(401);
    vi.mocked(db.sponsorship.findMany).mockResolvedValue([
      { id: "sp_1", impressions: 1000, taps: 25 },
    ] as never);
    const response = await report(adminRequest("GET", "secret"));
    const body = await response.json();
    expect(body.items[0].ctr).toBe(0.025);
    delete process.env.SPONSORSHIP_ADMIN_KEY;
  });

  it("stops and deletes a campaign", async () => {
    process.env.SPONSORSHIP_ADMIN_KEY = "secret";
    const stopped = await remove(adminRequest("DELETE", "secret"), {
      params: Promise.resolve({ id: "sp_1" }),
    });
    expect(stopped.status).toBe(200);
    expect(db.sponsorship.update).toHaveBeenCalledWith({
      where: { id: "sp_1" },
      data: { active: false },
    });
    delete process.env.SPONSORSHIP_ADMIN_KEY;
  });

  it("refuses lifecycle edits without the key", async () => {
    process.env.SPONSORSHIP_ADMIN_KEY = "secret";
    expect(
      (await patch(adminRequest("PATCH"), {
        params: Promise.resolve({ id: "sp_1" }),
      })).status
    ).toBe(401);
    delete process.env.SPONSORSHIP_ADMIN_KEY;
  });
});
