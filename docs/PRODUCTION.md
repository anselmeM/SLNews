# Production Notes

## Implemented Operational Controls

- Prisma uses a PostgreSQL pool, retry logic, and production-aware timeouts.
- News, market, and announcement reads use request caching.
- Rate limiting is DB-backed where it protects authentication, password reset, and push subscription. Search uses the in-memory limiter.
- `proxy.ts` applies route protection and security headers; `next.config.ts` adds the content-security policy and standard browser protections.
- `/api/health` checks application and database availability.
- Sentry wrapping, structured logging, and error-reporting helpers are configured.
- The PWA service worker is generated at production build time by `@ducanh2912/next-pwa`.

## Required Configuration

| Variable | Required for |
|---|---|
| `DATABASE_URL` | Application database |
| `NEXTAUTH_SECRET` | Auth.js session signing |
| `NEXTAUTH_URL` | Local Auth.js callback URL |
| `CRON_SECRET` | Scheduled sync authentication |

## Optional Integrations

| Variable | Used by |
|---|---|
| `NEWS_API_KEY` or `MEDIASTACK_API_KEY` | World-news sync |
| `SCRAPER_API_KEY` | Sierra Leone news scraper sync |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring DSNs |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Sentry build integration |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL defaults |

## Deployment Checks

1. Apply the Prisma schema before serving traffic.
2. Run `npm run lint`, `npm run test:run`, and `npm run build`.
3. Confirm the build emitted `public/sw.js` and Workbox assets.
4. Set `CRON_SECRET` in the deployment environment; Vercel invokes `/api/cron/sync?secret=${CRON_SECRET}` at 06:30 UTC daily.
5. Fix the legacy redirects to `/news` before exposing `/local` or `/national` links.

Open product and policy decisions are tracked in `docs/TODO.md`.
