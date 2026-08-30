import { describe, it, expect } from "vitest";
import { isOwnerOrAdminEmail, authCallbacks } from "../auth-callbacks";

describe("Strict Admin Role Security & Owner Whitelist", () => {
  it("recognizes anselme.motcho@gmail.com and anselmemotcho@gmail.com as owner/admin", () => {
    expect(isOwnerOrAdminEmail("anselme.motcho@gmail.com")).toBe(true);
    expect(isOwnerOrAdminEmail("anselmemotcho@gmail.com")).toBe(true);
    expect(isOwnerOrAdminEmail("ANSELME.MOTCHO@GMAIL.COM")).toBe(true);
    expect(isOwnerOrAdminEmail("ANSELMEMOTCHO@GMAIL.COM")).toBe(true);
    expect(isOwnerOrAdminEmail("  anselme.motcho@gmail.com  ")).toBe(true);
  });

  it("handles gmail dot insensitivity for owner", () => {
    expect(isOwnerOrAdminEmail("a.n.s.e.l.m.e.motcho@gmail.com")).toBe(true);
  });

  it("strictly denies admin rights to all other reader and creator emails", () => {
    expect(isOwnerOrAdminEmail("reader@example.com")).toBe(false);
    expect(isOwnerOrAdminEmail("admin@otherdomain.com")).toBe(false);
    expect(isOwnerOrAdminEmail("")).toBe(false);
    expect(isOwnerOrAdminEmail(null)).toBe(false);
    expect(isOwnerOrAdminEmail(undefined)).toBe(false);
  });

  it("sets role to ADMIN in jwt callback for owner", async () => {
    const token = await authCallbacks.callbacks.jwt({
      token: {},
      user: {
        id: "user-owner",
        email: "anselme.motcho@gmail.com",
        role: "USER" as unknown as undefined,
      },
      account: null,
    });
    expect((token as Record<string, unknown>).role).toBe("ADMIN");
  });

  it("restricts/downgrades non-owner trying to hold ADMIN in jwt callback", async () => {
    const token = await authCallbacks.callbacks.jwt({
      token: {},
      user: {
        id: "user-attacker",
        email: "attacker@example.com",
        role: "ADMIN" as unknown as undefined,
      },
      account: null,
    });
    expect((token as Record<string, unknown>).role).toBe("EDITOR");
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
          id: "user-owner",
          email: "anselme.motcho@gmail.com",
          role: "USER",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      token: {
        id: "user-owner",
        email: "anselme.motcho@gmail.com",
        role: "USER",
      },
    } as unknown as Parameters<typeof authCallbacks.callbacks.session>[0];

    const session = await authCallbacks.callbacks.session(params);
    expect(session.user.role).toBe("ADMIN");
  });

  it("blocks non-owner from receiving ADMIN role in session callback", async () => {
    const params = {
      session: {
        user: {
          id: "user-attacker",
          email: "attacker@example.com",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      token: {
        id: "user-attacker",
        email: "attacker@example.com",
        role: "ADMIN",
      },
    } as unknown as Parameters<typeof authCallbacks.callbacks.session>[0];

    const session = await authCallbacks.callbacks.session(params);
    expect(session.user.role).toBe("EDITOR");
  });
});
