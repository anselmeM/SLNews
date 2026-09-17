# Clerk Production Setup — Get Off the Dev Instance & Enable Own-Domain Auth

Runbook for moving SLNews production from the Clerk **development** instance onto the
**production** instance, and (optionally) serving Clerk's Frontend API from our own domain.

> **Why this matters:** production (`https://sl-news.vercel.app`) currently authenticates
> against a Clerk **development** instance (`pk_test_…`, `…clerk.accounts.dev`, the sign-in
> card shows *"Development mode"*). Clerk explicitly throttles development instances and
> says not to use them in production. A sign-in hang was reported in Sep 2026 and could not
> be reproduced from outside; the dev instance + a third-party domain call are the prime
> suspects. See the auth hardening in PR #63 (`src/auth.ts`, `src/middleware.ts`).

## Two hard constraints (from Clerk's docs)

- **The proxy only works on a *production* instance** — not on a development instance.
- A production instance needs a **domain you own** (DNS). `*.vercel.app` cannot be added, so
  this uses a real domain (e.g. `slnews.sl`, the domain already used in the TWA manifest).

---

## Part A — Get off the Clerk dev instance

### 0. Prerequisites

- Access to the Clerk dashboard for the **production** instance.
- DNS access for your domain (e.g. `slnews.sl`).
- Access to the Vercel `sl-news` project.

### 1. Create / open the production instance

Clerk dashboard → instance switcher (top-left) → **Production** (create it if it does not exist).

### 2. Add your application domain

Dashboard → **Domains** → **Add domain** → enter the domain users will visit
(e.g. `slnews.sl`, or `app.slnews.sl`). Clerk then shows the DNS records it needs.

### 3. Add the DNS records (the dashboard is the source of truth)

Typical set:

| Type  | Name           | Target                               |
| :---- | :------------- | :----------------------------------- |
| CNAME | `clerk`        | `frontend-api.clerk.services`        |
| CNAME | `accounts`     | `accounts.clerk.services`            |
| CNAME | `clkmail`      | `mail.<instance>.clerk.services`     |
| CNAME | `clk._domainkey`  | `dkim1.<instance>.clerk.services` |
| CNAME | `clk2._domainkey` | `dkim2.<instance>.clerk.services` |

- On **Cloudflare**, set these to **DNS only** (grey cloud, not orange) — Clerk needs direct
  resolution.
- Propagation can take minutes up to 48h; the dashboard shows a **Verified** state.
- The `clerk.` CNAME is the own-domain Frontend API — see Part B.

### 4. Point the app at the production domain (recommended)

Vercel → `sl-news` → **Domains** → add `slnews.sl` (or `app.slnews.sl`) so the app is served
on the same domain as the Clerk instance.

### 5. Copy the production keys

Dashboard → **API Keys** → copy **`pk_live_…`** and **`sk_live_…`**.

### 6. Set them in Vercel (Production environment)

Vercel → `sl-news` → **Settings → Environment Variables → Production**:

| Variable                             | Value                                      |
| :----------------------------------- | :----------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | `pk_live_…`                                 |
| `CLERK_SECRET_KEY`                   | `sk_live_…`                                 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`      | `/sign-in`                                  |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`      | `/sign-up`                                  |
| `NEXT_PUBLIC_SITE_URL`               | `https://slnews.sl` (so reset/share links are correct) |

> **Redeploy with a fresh build.** `NEXT_PUBLIC_*` values are inlined at **build** time, so
> uncheck **"Use existing Build Cache"** or push any commit. A plain redeploy can keep the old
> `pk_test_` value baked in.

### 7. Verify

- Open `/sign-in` → the Clerk card should **no longer say "Development mode"**.
- Browser console → no more "development keys" warning.
- Auth requests should go to **your** domain (`clerk.slnews.sl`), not `…clerk.accounts.dev`.

### 8. What does **not** carry over

- **Accounts do not migrate.** Users in the dev instance do not exist in production and must
  register again.
- **Social logins (Google / Facebook)** need **your own** OAuth credentials in the production
  instance (dev instances use Clerk's shared ones).
- Keep the dev instance keys for **local + CI**: `.env` and `.github/workflows/ci.yml` use
  `pk_test_b3B0…` — CI staying on a dev instance is fine.

---

## Part B — Own-domain auth

Two options. **Part A's CNAME already achieves own-domain auth** for most cases.

### Option B1 — CNAME (recommended, no app code)

The step-3 record `clerk.slnews.sl → frontend-api.clerk.services` already serves the Frontend
API on our own domain. Nothing to change in the app. This is Clerk's default production path.

### Option B2 — Full proxy (only if you can't use a CNAME, or want logging/SSL control)

The Frontend API is served at `https://slnews.sl/__clerk/*` and forwarded to
`frontend-api.clerk.services`.

1. **App side** — Clerk's Next.js SDK has a built-in handler:
   ```ts
   // src/middleware.ts
   export default clerkMiddleware(/* handler */, { frontendApiProxy: { enabled: true } });
   ```
   and the matcher must include `'/__clerk/(.*)'`. Our `src/middleware.ts` currently passes a
   callback, so it needs the option + matcher added. **Caveat:** `@clerk/nextjs` is **7.9.1**;
   confirm `frontendApiProxy` exists there and bump to `7.9.4` if needed.
2. **Dashboard side** — Domains → Frontend API → **Advanced** → set **Proxy URL** =
   `https://slnews.sl/__clerk` (Clerk validates it; production instances only). Use
   `POST /v1/proxy_checks` first if you want to avoid downtime.
3. **Client config** — set `proxyUrl` on `<ClerkProvider>` or
   `NEXT_PUBLIC_CLERK_PROXY_URL=https://slnews.sl/__clerk`.
4. **Notes** — the proxy must forward `Clerk-Proxy-Url`, `Clerk-Secret-Key`, and
   `X-Forwarded-For` (Clerk's built-in handler does this). Set `authorizedParties` in the
   dashboard for security.

---

## Repo-side changes (once the dashboard/DNS steps are done)

- **Part B2 only:** add `frontendApiProxy` + the `/__clerk` matcher to `src/middleware.ts`
  (and bump `@clerk/nextjs` if required).
- Update `NEXT_PUBLIC_SITE_URL` guidance in `.env.example` / `docs/PRODUCTION.md`.
- Confirm the CSP in `next.config.ts` still allows what's needed (it already allows
  `*.clerk.com` / `*.clerk.accounts.dev`; with our own domain, fewer third-party origins are
  required).
- Nothing is needed for **Option B1** (CNAME) — it is dashboard/DNS only.

---

## Sources

- [Clerk — Proxy the Frontend API](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi.md)
- [Clerk — Deploy to production](https://github.com/clerk/clerk-docs/blob/126650ba/docs/deployments/overview.mdx)
- [Clerk — Using proxies](https://github.com/clerk/clerk-docs/blob/126650ba/docs/advanced-usage/using-proxies.mdx)
