/**
 * TLS configuration for the Postgres connection, made explicit.
 *
 * Why this exists: `pg-connection-string` (2.14) treats `prefer`, `require` and
 * `verify-ca` as aliases for `verify-full` — so today a Neon URL saying
 * `sslmode=require` *is* verifying the server certificate — and it prints a
 * security warning to say so. In pg-connection-string v3 / pg v9 those modes
 * adopt standard libpq semantics, which are weaker: `require` will mean
 * "encrypt, but do not verify the certificate", and `prefer` will fall back to
 * plaintext. So an upgrade we do not control would silently downgrade the
 * connection, and until then every cold start logs the warning.
 *
 * The intent of the deployment is "TLS, with the certificate verified". Saying
 * that in code keeps it true across the upgrade, and matches what actually
 * happens today.
 *
 * The URL has to be the one that changes, not the options: pg resolves TLS with
 * `Object.assign({}, config, parse(config.connectionString))`
 * (pg/lib/connection-parameters.js), so a parsed `sslmode` overrides any `ssl`
 * passed in the pool options. Removing `sslmode` after reading it is the only way
 * to make the explicit configuration the effective one.
 */

/** `false` disables TLS; an object is handed to Node's `tls.connect`. */
export type PgSslConfig = false | { rejectUnauthorized: boolean };

export interface ResolvedPgConnection {
  /** The URL to hand to `pg`, with `sslmode` removed when we resolve TLS here. */
  connectionString: string;
  /**
   * The TLS config to pass as `ssl`. `undefined` means "the URL said nothing
   * about TLS" and the caller decides — see `unset`.
   */
  ssl?: PgSslConfig;
  /** The URL carried no `sslmode`: the caller's policy applies. */
  unset: boolean;
  /**
   * The URL opted into libpq semantics (`uselibpqcompat=true`), which is an
   * explicit request for the weaker modes. It is left untouched rather than
   * overridden: silently ignoring an operator's stated intent is worse than a
   * warning they asked for.
   */
  libpqCompat: boolean;
}

/**
 * Reads `sslmode` out of a connection string and returns the URL to use plus the
 * TLS configuration that should apply.
 */
export function resolvePgConnection(rawUrl: string): ResolvedPgConnection {
  const unchanged: ResolvedPgConnection = {
    connectionString: rawUrl,
    ssl: undefined,
    unset: true,
    libpqCompat: false,
  };

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    // Not a URL we can take apart — leave it to pg.
    return unchanged;
  }

  const mode = url.searchParams.get("sslmode");
  if (!mode) return unchanged;

  if (url.searchParams.get("uselibpqcompat") === "true") {
    return { ...unchanged, libpqCompat: true };
  }

  // pg must not see the alias, or it overrides this decision (and warns).
  url.searchParams.delete("sslmode");

  return {
    connectionString: url.toString(),
    // `disable` is the only mode that turns TLS off. Everything else means TLS
    // with the certificate *and hostname* verified — which is what `require` has
    // meant in practice, and what we want it to keep meaning.
    ssl: mode === "disable" ? false : { rejectUnauthorized: true },
    unset: false,
    libpqCompat: false,
  };
}
