import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAssertion,
  isFcmConfigured,
  parseServiceAccount,
  resetTokenCache,
  sendNativePush,
  type NativePushDb,
} from "@/lib/push/fcm";

/** A throwaway RSA key so the JWT signature is really produced and checked. */
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = {
  project_id: "slnews-test",
  client_email: "push@slnews-test.iam.gserviceaccount.com",
  private_key: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
  type: "service_account",
};

function dbWith(tokens: string[], deleted: string[] = []): NativePushDb {
  return {
    mobileDevice: {
      findMany: vi.fn().mockResolvedValue(tokens.map((token) => ({ token }))),
      deleteMany: vi.fn(async (args: unknown) => {
        const where = (args as { where?: { token?: { in?: string[] } } }).where;
        deleted.push(...(where?.token?.in ?? []));
        return { count: where?.token?.in?.length ?? 0 };
      }),
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const message = {
  title: "Breaking",
  body: "Something happened",
  url: "/article/1",
  category: "breaking",
};

describe("parseServiceAccount", () => {
  it("accepts the raw JSON Firebase gives you", () => {
    const parsed = parseServiceAccount(JSON.stringify(serviceAccount));
    expect(parsed).toEqual({
      projectId: "slnews-test",
      clientEmail: "push@slnews-test.iam.gserviceaccount.com",
      privateKey: serviceAccount.private_key,
    });
  });

  it("accepts a base64-encoded copy of the same JSON", () => {
    const encoded = Buffer.from(JSON.stringify(serviceAccount), "utf8").toString("base64");
    expect(parseServiceAccount(encoded)?.projectId).toBe("slnews-test");
  });

  it("rejects missing, malformed and incomplete credentials", () => {
    expect(parseServiceAccount(undefined)).toBeNull();
    expect(parseServiceAccount("   ")).toBeNull();
    expect(parseServiceAccount("not json")).toBeNull();
    expect(
      parseServiceAccount(JSON.stringify({ project_id: "x", client_email: "nope" }))
    ).toBeNull();
    expect(
      parseServiceAccount(
        JSON.stringify({ project_id: "x", client_email: "a@b.c", private_key: "nope" })
      )
    ).toBeNull();
  });
});

describe("buildAssertion", () => {
  it("produces a signed RS256 JWT for the messaging scope", () => {
    const config = parseServiceAccount(JSON.stringify(serviceAccount))!;
    const parts = buildAssertion(config, 1_700_000_000).split(".");
    const header = parts[0] ?? "";
    const claims = parts[1] ?? "";
    const signature = parts[2] ?? "";

    expect(signature.length).toBeGreaterThan(100);
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({
      alg: "RS256",
      typ: "JWT",
    });
    expect(JSON.parse(Buffer.from(claims, "base64url").toString())).toEqual({
      iss: "push@slnews-test.iam.gserviceaccount.com",
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: 1_700_000_000,
      exp: 1_700_003_600,
    });
  });
});

describe("isFcmConfigured", () => {
  const original = process.env.FIREBASE_SERVICE_ACCOUNT;
  afterEach(() => {
    if (original === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT;
    else process.env.FIREBASE_SERVICE_ACCOUNT = original;
  });

  it("is false without credentials and true with them", () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    expect(isFcmConfigured()).toBe(false);
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(serviceAccount);
    expect(isFcmConfigured()).toBe(true);
  });
});

describe("sendNativePush", () => {
  const original = process.env.FIREBASE_SERVICE_ACCOUNT;

  beforeEach(() => {
    resetTokenCache();
    vi.stubGlobal("fetch", vi.fn());
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(serviceAccount);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetTokenCache();
    if (original === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT;
    else process.env.FIREBASE_SERVICE_ACCOUNT = original;
  });

  it("is inert without credentials and never touches the database", async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    const db = dbWith([]);

    const result = await sendNativePush(message, { db });

    expect(result).toEqual({ sent: 0, failed: 0, invalid: 0, skipped: "not-configured" });
    expect(db.mobileDevice.findMany).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("exchanges a token once and sends the message to every device", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: "ya29.token", expires_in: 3600 }))
      .mockResolvedValue(jsonResponse({ name: "projects/x/messages/1" }));
    const db = dbWith(["token-a", "token-b"]);

    const result = await sendNativePush(message, { db });

    expect(result).toEqual({ sent: 2, failed: 0, invalid: 0 });
    expect(fetch).toHaveBeenCalledTimes(3); // one token exchange + two sends
    const sendCall = vi.mocked(fetch).mock.calls[1];
    expect(sendCall).toBeDefined();
    expect(String(sendCall?.[0])).toContain("/projects/slnews-test/messages:send");
    const body = JSON.parse(String((sendCall?.[1] as RequestInit).body));
    expect(body.message.notification).toEqual({ title: "Breaking", body: "Something happened" });
    expect(body.message.data).toEqual({ url: "/article/1", category: "breaking" });
    expect(db.mobileDevice.deleteMany).not.toHaveBeenCalled();
  });

  it("prunes tokens FCM says are unregistered and keeps sending the rest", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ access_token: "ya29.token", expires_in: 3600 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { details: [{ errorCode: "UNREGISTERED" }] } }), {
          status: 404,
        })
      )
      .mockResolvedValueOnce(jsonResponse({ name: "ok" }));
    const deleted: string[] = [];
    const db = dbWith(["gone-token", "live-token"], deleted);

    const result = await sendNativePush(message, { db });

    expect(result).toEqual({ sent: 1, failed: 1, invalid: 1 });
    expect(deleted).toEqual(["gone-token"]);
    expect(db.mobileDevice.deleteMany).toHaveBeenCalledWith({
      where: { token: { in: ["gone-token"] } },
    });
  });

  it("reports failures without throwing when the token exchange fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("nope", { status: 500 }));
    const db = dbWith(["token-a", "token-b"]);

    const result = await sendNativePush(message, { db });

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns zeroes without spending an OAuth call when nobody is registered", async () => {
    const db = dbWith([]);

    const result = await sendNativePush(message, { db });

    expect(result).toEqual({ sent: 0, failed: 0, invalid: 0 });
    expect(fetch).not.toHaveBeenCalled();
  });
});
