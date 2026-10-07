import { Client } from "pg";
import { describe, expect, it, vi } from "vitest";
import { resolvePgConnection } from "@/lib/db-ssl";

const NEON = "postgresql://user:pass@ep-example-1.us-east-1.aws.neon.tech/neondb";

describe("resolvePgConnection", () => {
  it("keeps TLS on and verified for the modes named in the deprecation", () => {
    // pg-connection-string reads these as verify-full today and will weaken them
    // in v3, so pin the behaviour we actually want.
    for (const mode of ["require", "prefer", "verify-ca", "verify-full"]) {
      const resolved = resolvePgConnection(`${NEON}?sslmode=${mode}`);

      expect(resolved.ssl, mode).toEqual({ rejectUnauthorized: true });
      expect(resolved.unset, mode).toBe(false);
    }
  });

  it("turns TLS off only for sslmode=disable", () => {
    expect(resolvePgConnection(`${NEON}?sslmode=disable`).ssl).toBe(false);
  });

  it("removes sslmode so pg cannot override the decision", () => {
    // pg merges the parsed URL over the pool options, so leaving the alias in
    // place is what made an explicit ssl config ineffective.
    const resolved = resolvePgConnection(`${NEON}?sslmode=require`);

    expect(resolved.connectionString).not.toContain("sslmode");
    expect(resolved.connectionString).toContain("ep-example-1.us-east-1.aws.neon.tech");
    expect(resolved.connectionString).toContain("neondb");
  });

  it("keeps the credentials and the other query parameters intact", () => {
    const resolved = resolvePgConnection(
      `postgresql://user:p%40ss%2Fword@host.example.com:5432/db?sslmode=require&channel_binding=require&connect_timeout=10`
    );
    const url = new URL(resolved.connectionString);

    expect(url.username).toBe("user");
    expect(decodeURIComponent(url.password)).toBe("p@ss/word");
    expect(url.port).toBe("5432");
    expect(url.searchParams.get("channel_binding")).toBe("require");
    expect(url.searchParams.get("connect_timeout")).toBe("10");
    expect(url.searchParams.has("sslmode")).toBe(false);
  });

  it("reports a URL with no sslmode as unset, so the caller decides", () => {
    const resolved = resolvePgConnection("postgresql://user:pass@127.0.0.1:5432/slnews");

    expect(resolved.unset).toBe(true);
    expect(resolved.ssl).toBeUndefined();
    expect(resolved.connectionString).toBe("postgresql://user:pass@127.0.0.1:5432/slnews");
  });

  it("leaves an explicit libpq opt-in alone instead of overriding it", () => {
    const raw = `${NEON}?uselibpqcompat=true&sslmode=require`;
    const resolved = resolvePgConnection(raw);

    expect(resolved.libpqCompat).toBe(true);
    expect(resolved.connectionString).toBe(raw);
    expect(resolved.ssl).toBeUndefined();
  });

  it("leaves an unparseable connection string to pg", () => {
    const resolved = resolvePgConnection("not a url");

    expect(resolved.connectionString).toBe("not a url");
    expect(resolved.unset).toBe(true);
  });
});

/**
 * `Client` builds its `ConnectionParameters` in the constructor without opening a
 * socket, so these assert what pg would really do — `Pool` defers that work to
 * the first connect and would make the warning assertions pass vacuously.
 */
function effectiveSsl(config: { connectionString: string; ssl?: unknown }) {
  // `connectionParameters` is internal to pg but is the only way to observe what
  // it resolved without opening a socket. Reading it here is deliberate.
  const client = new Client(config as never) as unknown as {
    connectionParameters: { ssl: unknown };
  };
  return client.connectionParameters.ssl;
}

/**
 * The warning is emitted by `pg-connection-string`, which raises it once per
 * process (a module-level flag). Each case therefore re-imports a fresh copy, or
 * the second assertion would pass simply because the first one already warned.
 */
async function warningsForParsing(url: string): Promise<string[]> {
  vi.resetModules();
  const { parse } = (await import("pg-connection-string")) as {
    parse: (connectionString: string) => unknown;
  };
  const warnings: string[] = [];
  const spy = vi.spyOn(process, "emitWarning").mockImplementation((warning) => {
    warnings.push(String(warning));
  });
  try {
    parse(url);
  } finally {
    spy.mockRestore();
  }
  return warnings;
}

describe("the deprecation warning", () => {
  it("fires for the raw sslmode=require URL", async () => {
    const warnings = await warningsForParsing(`${NEON}?sslmode=require`);

    expect(warnings.join(" ")).toContain("SECURITY WARNING");
  });

  it("is gone once the URL has been resolved", async () => {
    const resolved = resolvePgConnection(`${NEON}?sslmode=require`);
    const warnings = await warningsForParsing(resolved.connectionString);

    expect(warnings).toEqual([]);
  });
});

describe("the assumption the fix rests on", () => {
  it("lets the connection string win over an explicit ssl option", () => {
    // pg/lib/connection-parameters.js:60 is
    //   Object.assign({}, config, parse(config.connectionString))
    // so `sslmode` in the URL overrides `ssl` in the options. That is the whole
    // reason resolvePgConnection removes the parameter rather than just passing
    // a stricter `ssl`. If pg ever flips this precedence, this test fails and
    // the reason for strippping the parameter needs re-checking.
    const viaUrlOnly = effectiveSsl({ connectionString: `${NEON}?sslmode=require` });
    const withExplicit = effectiveSsl({
      connectionString: `${NEON}?sslmode=require`,
      ssl: { rejectUnauthorized: false },
    });

    expect(withExplicit).toEqual(viaUrlOnly);
    expect(withExplicit).not.toEqual({ rejectUnauthorized: false });
  });

  it("applies the resolved config once the parameter is gone", () => {
    const resolved = resolvePgConnection(`${NEON}?sslmode=require`);

    expect(effectiveSsl({ connectionString: resolved.connectionString, ssl: resolved.ssl })).toEqual(
      { rejectUnauthorized: true }
    );
  });

  it("disables TLS when the URL says disable", () => {
    const resolved = resolvePgConnection(`${NEON}?sslmode=disable`);

    expect(
      effectiveSsl({ connectionString: resolved.connectionString, ssl: resolved.ssl })
    ).toBe(false);
  });
});
