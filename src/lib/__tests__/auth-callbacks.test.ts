import { describe, it, expect } from "vitest";
import { isOwnerOrAdminEmail, ADMIN_EMAILS } from "../auth-callbacks";

describe("Strict Admin Role Security & Owner Whitelist", () => {
  it("contains the primary admin and owner emails in whitelist", () => {
    expect(ADMIN_EMAILS).toContain("anselme.motcho@gmail.com");
    expect(ADMIN_EMAILS).toContain("anselmemotcho@gmail.com");
  });

  it("recognizes anselme.motcho@gmail.com and anselmemotcho@gmail.com as owner/admin", () => {
    expect(isOwnerOrAdminEmail("anselme.motcho@gmail.com")).toBe(true);
    expect(isOwnerOrAdminEmail("anselmemotcho@gmail.com")).toBe(true);
    expect(isOwnerOrAdminEmail("ANSELME.MOTCHO@GMAIL.COM")).toBe(true);
    expect(isOwnerOrAdminEmail("ANSELMEMOTCHO@GMAIL.COM")).toBe(true);
    expect(isOwnerOrAdminEmail("  anselme.motcho@gmail.com  ")).toBe(true);
  });

  it("handles gmail dot insensitivity for owner", () => {
    expect(isOwnerOrAdminEmail("a.n.s.e.l.m.e.motcho@gmail.com")).toBe(true);
    expect(isOwnerOrAdminEmail("anselme.m.o.t.c.h.o@gmail.com")).toBe(true);
  });

  it("strictly denies admin rights to all other reader and creator emails", () => {
    expect(isOwnerOrAdminEmail("reader@example.com")).toBe(false);
    expect(isOwnerOrAdminEmail("admin@otherdomain.com")).toBe(false);
    expect(isOwnerOrAdminEmail("")).toBe(false);
    expect(isOwnerOrAdminEmail(null)).toBe(false);
    expect(isOwnerOrAdminEmail(undefined)).toBe(false);
  });
});
