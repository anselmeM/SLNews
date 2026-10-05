import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

vi.mock("@/lib/db", () => ({
  db: {
    retentionDay: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const upsert = vi.mocked(db.retentionDay.upsert);
const findMany = vi.mocked(db.retentionDay.findMany);

function post(body: unknown, ip = "203.0.113.7"): Request {
  return new Request("http://localhost/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsert.mockResolvedValue({} as never);
  });

  it("still logs a pageview and stores nothing", async () => {
    const response = await POST(post({ path: "/", referrer: "https://x.test" }));

    expect(response.status).toBe(204);
    expect(logger.info).toHaveBeenCalledWith("pageview", {
      path: "/",
      referrer: "https://x.test",
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("counts a first visit", async () => {
    const response = await POST(post({ kind: "session", returning: false }));

    expect(response.status).toBe(204);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ firstVisits: 1, returningVisits: 0 }),
        update: { firstVisits: { increment: 1 } },
      })
    );
  });

  it("counts a return visit", async () => {
    await POST(post({ kind: "session", returning: true }));

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ firstVisits: 0, returningVisits: 1 }),
        update: { returningVisits: { increment: 1 } },
      })
    );
  });

  it("treats a missing or non-boolean returning flag as a first visit", async () => {
    await POST(post({ kind: "session" }));
    await POST(post({ kind: "session", returning: "yes" }));

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ update: { firstVisits: { increment: 1 } } })
    );
    expect(upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ update: { firstVisits: { increment: 1 } } })
    );
  });

  it("ignores a malformed body instead of failing the beacon", async () => {
    const response = await POST(post("{not json"));

    expect(response.status).toBe(204);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("returns 204 even when the counter cannot be written", async () => {
    upsert.mockRejectedValue(new Error("relation does not exist") as never);

    const response = await POST(post({ kind: "session", returning: false }));

    expect(response.status).toBe(204);
    expect(logger.warn).toHaveBeenCalled();
  });
});

describe("GET /api/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([] as never);
  });

  it("returns the daily return rate", async () => {
    findMany.mockResolvedValue([
      {
        day: new Date("2026-10-04T00:00:00.000Z"),
        firstVisits: 6,
        returningVisits: 2,
        updatedAt: new Date(),
      },
      {
        day: new Date("2026-10-05T00:00:00.000Z"),
        firstVisits: 0,
        returningVisits: 0,
        updatedAt: new Date(),
      },
    ] as never);

    const response = await GET(new Request("http://localhost/api/analytics?days=7"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.days).toEqual([
      {
        day: "2026-10-04",
        firstVisits: 6,
        returningVisits: 2,
        returningShare: 0.25,
      },
      {
        day: "2026-10-05",
        firstVisits: 0,
        returningVisits: 0,
        returningShare: null,
      },
    ]);
  });

  it("defaults to a two-week window and clamps what a caller may ask for", async () => {
    await GET(new Request("http://localhost/api/analytics"));
    const defaultSince = vi.mocked(findMany).mock.calls[0]?.[0]?.where;

    await GET(new Request("http://localhost/api/analytics?days=9999"));
    const clampedSince = vi.mocked(findMany).mock.calls[1]?.[0]?.where;

    expect(defaultSince).toBeDefined();
    expect(clampedSince).toBeDefined();
    // 9999 days clamps to the 60-day maximum, so its window starts earlier.
    const asTime = (where: unknown) =>
      (where as { day: { gte: Date } }).day.gte.getTime();
    expect(asTime(clampedSince)).toBeLessThan(asTime(defaultSince));
  });

  it("reports a failure rather than pretending there is no data", async () => {
    findMany.mockRejectedValue(new Error("db down") as never);

    const response = await GET(new Request("http://localhost/api/analytics"));

    expect(response.status).toBe(500);
    expect((await response.json()).days).toEqual([]);
  });
});
