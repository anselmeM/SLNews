import { describe, expect, it } from "vitest";
import { clerkFrontendApiOrigin } from "@/lib/clerk-csp";

// The real CI/dev publishable key encodes this host.
const DEV_KEY = "pk_test_b3B0aW1hbC1zaGVwaGVyZC01OTE5LmNsZXJrLmFjY291bnRzLmRldiQ";

const liveKeyFor = (host: string) =>
  `pk_live_${Buffer.from(`${host}$`).toString("base64")}`;

describe("clerkFrontendApiOrigin", () => {
  it("derives the frontend API origin from a development key", () => {
    expect(clerkFrontendApiOrigin(DEV_KEY)).toBe(
      "https://optimal-shepherd-5919.clerk.accounts.dev"
    );
  });

  it("derives our own domain from a production key", () => {
    // This is the case that matters: after the cutover the Frontend API moves to
    // a domain that is not in the static CSP allow-list.
    expect(clerkFrontendApiOrigin(liveKeyFor("clerk.slnews.sl"))).toBe(
      "https://clerk.slnews.sl"
    );
  });

  it("returns null when the key is missing", () => {
    expect(clerkFrontendApiOrigin(undefined)).toBeNull();
    expect(clerkFrontendApiOrigin("")).toBeNull();
  });

  it("returns null when there is no third segment", () => {
    expect(clerkFrontendApiOrigin("not-a-key")).toBeNull();
    expect(clerkFrontendApiOrigin("pk_test_")).toBeNull();
  });

  it("returns null for undecodable base64", () => {
    expect(clerkFrontendApiOrigin("pk_test_!!!not-base64!!!")).toBeNull();
  });

  it("rejects a decoded value that is not a hostname", () => {
    // Guards the policy: a malformed key must not be able to inject an entry
    // containing wildcards, spaces or paths.
    for (const injected of ["example.com; script-src *", "*", "https://evil.com", "a b.com"]) {
      expect(clerkFrontendApiOrigin(liveKeyFor(injected))).toBeNull();
    }
  });

  it("tolerates a decoded host without the trailing terminator", () => {
    const withoutTerminator = `pk_live_${Buffer.from("clerk.example.com").toString("base64")}`;
    expect(clerkFrontendApiOrigin(withoutTerminator)).toBe("https://clerk.example.com");
  });
});
