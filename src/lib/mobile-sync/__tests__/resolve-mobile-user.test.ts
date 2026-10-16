/**
 * Auth-resolution tests: bearer first, cookie session second, and the
 * `User`-row bootstrap that lets a reader sync from a phone that has never
 * opened the website.
 *
 * Prisma and Clerk are mocked at their module boundary; the resolver itself is
 * the real one, so the lookup order (id â†’ email â†’ create) is exercised rather
 * than described.
 */
import { verifyToken } from "@clerk/backend";
import { auth as cookieAuth, currentUser } from "@clerk/nextjs/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isBearerHeader,
  readBearerToken,
  resolveMobileUser,
  type MobileUser,
} from "../resolve-mobile-user";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@clerk/backend", () => ({ verifyToken: vi.fn() }));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: vi.fn(), auth: vi.fn() }));

type AsyncMock = ReturnType<typeof vi.fn>;

const findUnique = db.user.findUnique as unknown as AsyncMock;
const update = db.user.update as unknown as AsyncMock;
const create = db.user.create as unknown as AsyncMock;
const verify = verifyToken as unknown as AsyncMock;
const clerkUser = currentUser as unknown as AsyncMock;
const cookieSession = cookieAuth as unknown as AsyncMock;

const CLERK_ID = "user_2RfWKJREkjKbHZy0Wqa5qrHeAnb";
const EMAIL = "probe@example.test";

function userRow(overrides: Record<string, unknown> = {}) {
  return {
    id: CLERK_ID,
    email: EMAIL,
    name: "Probe Reader",
    image: null,
    role: "USER",
    ...overrides,
  };
}

function headers(init: Record<string, string> = {}): Headers {
  return new Headers(init);
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CLERK_SECRET_KEY = "sk_test_secret";
  delete process.env.CLERK_AUTHORIZED_PARTIES;

  // `@clerk/backend` v3 resolves with the claims themselves and throws on any
  // failure, so the mock mirrors that contract (see the note on
  // `resolveBearerIdentity`). An earlier revision mocked the removed
  // `{ data, errors }` shape, which hid a bug that 401'd every real token.
  verify.mockResolvedValue({
    sub: CLERK_ID,
    email: EMAIL,
    given_name: "Probe",
    family_name: "Reader",
  });
  clerkUser.mockResolvedValue(null);
  cookieSession.mockResolvedValue({ userId: null });
  findUnique.mockResolvedValue(null);
  update.mockResolvedValue(userRow());
  create.mockResolvedValue(userRow());
});

describe("readBearerToken", () => {
  it("reads a standard bearer header", () => {
    expect(readBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(readBearerToken("bearer abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("treats an empty bearer as no token", () => {
    expect(readBearerToken("Bearer ")).toBeNull();
    expect(readBearerToken("Bearer")).toBeNull();
    expect(readBearerToken("")).toBeNull();
    expect(readBearerToken(null)).toBeNull();
  });

  it("rejects another scheme outright", () => {
    expect(readBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
    expect(isBearerHeader("Basic dXNlcjpwYXNz")).toBe(false);
    // `Bearer` with an empty token still has to be a 401, not a cookie fallback.
    expect(isBearerHeader("Bearer ")).toBe(true);
  });
});

describe("resolveMobileUser â€” bearer", () => {
  it("verifies the token with the configured secret and no parties by default", async () => {
    await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(verify).toHaveBeenCalledWith("probe.jwt.token", { secretKey: "sk_test_secret" });
    expect(cookieAuth).not.toHaveBeenCalled();
    expect(clerkUser).not.toHaveBeenCalled();
  });

  it("passes authorizedParties when CLERK_AUTHORIZED_PARTIES is set", async () => {
    process.env.CLERK_AUTHORIZED_PARTIES = "https://slnews.sl, http://localhost:3000";

    await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(verify).toHaveBeenCalledWith("probe.jwt.token", {
      secretKey: "sk_test_secret",
      authorizedParties: ["https://slnews.sl", "http://localhost:3000"],
    });
  });

  it("is unauthenticated when the verifier rejects an expired token", async () => {
    verify.mockRejectedValue(new Error("token-expired"));

    await expect(
      resolveMobileUser(headers({ authorization: "Bearer expired.jwt.token" }))
    ).resolves.toBeNull();
  });

  it("is unauthenticated when the verifier throws", async () => {
    verify.mockRejectedValue(new Error("bad signature"));

    await expect(
      resolveMobileUser(headers({ authorization: "Bearer forged.jwt.token" }))
    ).resolves.toBeNull();
  });

  it("is unauthenticated when a verified token carries no user id", async () => {
    verify.mockResolvedValue({ email: EMAIL });

    await expect(
      resolveMobileUser(headers({ authorization: "Bearer odd.jwt.token" }))
    ).resolves.toBeNull();
  });

  it("is unauthenticated when no secret key is configured", async () => {
    delete process.env.CLERK_SECRET_KEY;

    await expect(
      resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }))
    ).resolves.toBeNull();
    expect(verify).not.toHaveBeenCalled();
  });

  it("does not fall back to the cookie session when a bearer token is present", async () => {
    verify.mockRejectedValue(new Error("token-expired"));
    cookieSession.mockResolvedValue({ userId: "someone_else" });

    const user = await resolveMobileUser(headers({ authorization: "Bearer expired.token" }));

    expect(user).toBeNull();
    expect(clerkUser).not.toHaveBeenCalled();
  });

  it("is unauthenticated for an empty bearer rather than reading the cookie", async () => {
    cookieSession.mockResolvedValue({ userId: "someone_else" });

    await expect(resolveMobileUser(headers({ authorization: "Bearer " }))).resolves.toBeNull();
  });
});

describe("resolveMobileUser â€” cookie session", () => {
  it("resolves the session user when there is no Authorization header", async () => {
    clerkUser.mockResolvedValue({
      id: CLERK_ID,
      firstName: "Probe",
      lastName: "Reader",
      username: null,
      imageUrl: "https://img.test/a.png",
      primaryEmailAddressId: "idn_1",
      emailAddresses: [{ id: "idn_1", emailAddress: EMAIL }],
    });
    findUnique.mockResolvedValue(userRow());

    const user = await resolveMobileUser(headers());

    expect(user?.id).toBe(CLERK_ID);
    expect(clerkUser).toHaveBeenCalled();
  });

  it("falls back to the session id when the profile is unavailable", async () => {
    clerkUser.mockResolvedValue(null);
    cookieSession.mockResolvedValue({ userId: CLERK_ID });
    findUnique.mockResolvedValue(userRow());

    const user = await resolveMobileUser(headers());

    expect(user?.id).toBe(CLERK_ID);
    expect(cookieSession).toHaveBeenCalled();
  });

  it("is unauthenticated when the session lookup throws", async () => {
    clerkUser.mockRejectedValue(new Error("no request context"));

    await expect(resolveMobileUser(headers())).resolves.toBeNull();
  });

  it("is unauthenticated for a signed-out reader", async () => {
    await expect(resolveMobileUser(headers())).resolves.toBeNull();
  });
});

describe("User bootstrap", () => {
  it("reuses the row found by Clerk id without writing", async () => {
    findUnique.mockResolvedValue(userRow());

    const user = await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(user?.id).toBe(CLERK_ID);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: CLERK_ID } });
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("reuses an Auth.js-era row found by email instead of creating a duplicate", async () => {
    findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(userRow({ id: "cuid_authjs", name: "Old Name" }));
    update.mockResolvedValue(userRow({ id: "cuid_authjs", name: "Probe Reader" }));

    const user = await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(user?.id).toBe("cuid_authjs");
    expect(findUnique).toHaveBeenNthCalledWith(1, { where: { id: CLERK_ID } });
    expect(findUnique).toHaveBeenNthCalledWith(2, { where: { email: EMAIL } });
    expect(update).toHaveBeenCalledWith({
      where: { id: "cuid_authjs" },
      data: { name: "Probe Reader" },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the row with the Clerk id for a reader who signed in on mobile first", async () => {
    const user = await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(user?.id).toBe(CLERK_ID);
    expect(create).toHaveBeenCalledWith({
      data: {
        id: CLERK_ID,
        email: EMAIL,
        name: "Probe Reader",
        image: null,
        role: "USER",
      },
    });
  });

  it("normalizes the email before storing it", async () => {
    verify.mockResolvedValue({ sub: CLERK_ID, email: "  Probe@Example.TEST " });

    await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: EMAIL }) })
    );
  });

  it("grants ADMIN only to the owner whitelist", async () => {
    verify.mockResolvedValue({ sub: CLERK_ID, email: "anselme.motcho@gmail.com" });

    await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "ADMIN" }) })
    );
  });

  it("creates a row without an email when the token has none", async () => {
    verify.mockResolvedValue({ sub: CLERK_ID, username: "probe" });

    const user = await resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }));

    expect(user?.id).toBe(CLERK_ID);
    // With no email there is no second lookup to attempt.
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: null, name: "probe" }),
      })
    );
  });

  it("is unauthenticated when the database is unreachable", async () => {
    findUnique.mockRejectedValue(new Error("db down"));

    await expect(
      resolveMobileUser(headers({ authorization: "Bearer probe.jwt.token" }))
    ).resolves.toBeNull();
  });
});

describe("MobileUser role reporting", () => {
  it("does not hand back ADMIN to a non-whitelisted row that claims it", async () => {
    // Mirrors `src/auth.ts`: the whitelist wins over the stored role.
    findUnique.mockResolvedValue(userRow({ role: "ADMIN", email: "probe@example.test" }));

    const user = (await resolveMobileUser(
      headers({ authorization: "Bearer probe.jwt.token" })
    )) as MobileUser;

    expect(user.role).toBe("EDITOR");
  });
});
