# SLNews Roadmap

## Current State

SLNews has its core production architecture in place: App Router pages, Prisma/PostgreSQL persistence, Auth.js credentials authentication, PWA configuration, request caching, structured logging, error reporting, a health endpoint, rate limiting, unit tests, and Playwright coverage.

This is not a claim that every planned product flow is complete. The verified open work is tracked in `docs/TODO.md`.

## Next Priorities

1. Turn placeholder actions into real product flows: price alerts/reports, notice creation/detail, and contributor following.
2. Close the remaining accessibility work: interactive card semantics and a deliberate contrast review.
3. Add metadata for the small set of routes that still rely on root metadata.
4. Add test coverage reporting and production-mode PWA verification.

## Operational Features

- `vercel.json` schedules `/api/cron/sync` once per day at 06:30 UTC.
- PWA service-worker output is generated during production builds.
- Sentry is configured through `SENTRY_ORG`, `SENTRY_PROJECT`, and DSN variables.
- The app runs as a standalone Next.js output and exposes `/api/health`.

Environment-variable details and deployment caveats are maintained in `docs/PRODUCTION.md`.
