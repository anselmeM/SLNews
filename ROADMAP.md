# SLNews Roadmap

## Current State

SLNews has its core production architecture in place: App Router pages, Prisma/PostgreSQL persistence, Auth.js credentials authentication, PWA configuration, request caching, structured logging, error reporting, a health endpoint, rate limiting, unit tests, and Playwright coverage.

Product flows previously marked "coming soon" are implemented: price alerts and price reporting, notice detail and posting, and contributor following. Route metadata and production-mode PWA verification are covered by tests. The verified open work is tracked in `docs/TODO.md`.

## Next Priorities

1. Deliver price alerts via push: a scheduled check that compares fresh prices against stored `PriceAlert` rows and notifies owners.
2. Add a moderation screen for submitted `PriceReport` rows so editors can approve or reject them.
3. Personalize the home feed with followed contributors.
4. Enforce a test-coverage threshold in CI.

## Operational Features

- `vercel.json` schedules `/api/cron/sync` once per day at 06:30 UTC.
- PWA service-worker output is generated during production builds.
- Sentry is configured through `SENTRY_ORG`, `SENTRY_PROJECT`, and DSN variables.
- The app runs as a standalone Next.js output and exposes `/api/health`.

Environment-variable details and deployment caveats are maintained in `docs/PRODUCTION.md`.
