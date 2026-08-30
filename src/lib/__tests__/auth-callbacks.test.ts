import { describe, it, expect } from "vitest";
import { isOwnerOrAdminEmail, authCallbacks } from "../auth-callbacks";

describe("Auth Callbacks & Owner Admin Role Grant", () => {
  it("recognizes anselmemotcho@gmail.com as owner/admin", () => {
    expect(isOwnerOrAdminEmail("anselmemotcho@gmail.com")).toBe(true);
    expect(isOwnerOrAdminEmail("ANSELMEMOTCHO@GMAIL.COM")).toBe(true);
    expect(isOwnerOrAdminEmail("  anselmemotcho@gmail.com  ")).toBe(true);
  });

  it("does not grant admin to random reader emails", () => {
    expect(isOwnerOrAdminEmail("reader@example.com")).toBe(false);
    expect(isOwnerOrAdminEmail("")).toBe(false);
    expect(isOwnerOrAdminEmail(null)).toBe(false);
    expect(isOwnerOrAdminEmail(undefined)).toBe(false);
  });

  it("sets role to ADMIN in jwt callback for owner", async () => {
    const token = await authCallbacks.callbacks.jwt({
      token: {},
      user: {
        id: "user-123",
        email: "anselmemotcho@gmail.com",
        role: "USER" as unknown as undefined,
      },
      account: null,
    });
    expect((token as Record<string, unknown>).role).toBe("ADMIN");
  });

  it("preserves role for regular users in jwt callback", async () => {
    const token = await authCallbacks.callbacks.jwt({
      token: {},
      user: {
        id: "user-456",
        email: "reader@example.com",
        role: "USER" as unknown as undefined,
      },
      account: null,
    });
    expect((token as Record<string, unknown>).role).toBe("USER");
  });

  it("sets role to ADMIN in session callback for owner", async () => {
    const params = {
      session: {
        user: {
          id: "user-123",
          email: "anselmemotcho@gmail.com",
          role: "USER",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      token: {
        id: "user-123",
        role: "USER",
      },
    } as unknown as Parameters<typeof authCallbacks.callbacks.session>[0];

    const session = await authCallbacks.callbacks.session(params);
    expect(session.user.role).toBe("ADMIN");
  });
});
