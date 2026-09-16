# SLNews Roadmap

## Current State

SLNews runs in production on Vercel: Next.js App Router on Neon Postgres (Prisma),
with Clerk authentication. Shipped capabilities include news feeds (national,
world, local), article reading with offline support, market prices (FX, fuel,
commodities), community notices, daily briefings, listen/audio, reels, push
notifications, search, bookmarks, contributor following, price alerts, and price
reports. The platform layer includes structured logging, Sentry error reporting,
rate limiting, a health endpoint, PWA install flows, and campaign attribution
with an ad landing page at `/download`.

Quality gates: CI runs lint, unit tests, typecheck, build, and Playwright e2e on
every pull request. The suite is ~230 unit tests plus 28 e2e specs.

## Launch Plan

The four-month launch plan lives in `LAUNCH_ROADMAP.md` with a per-milestone
checklist (Milestone 1 hardening/tracking, Milestone 2 Android TWA packaging,
Milestone 3 December marketing, Milestone 4 public launch). The Milestone 3
operational runbook is `docs/MILESTONE-3-MARKETING.md`.

## Next Priorities

Tracked in `docs/TODO.md`. Near-term:

1. Deliver price alerts via push: compare fresh prices against stored `PriceAlert`
   rows and notify owners on a schedule.
2. Add a moderation screen for submitted `PriceReport` rows.
3. Personalize the home feed with followed contributors.
4. Enforce a test-coverage threshold in CI.

## Operational Features

- `vercel.json` schedules `/api/cron/sync` at 06:30 UTC and `/api/cron/briefing`
  at 07:00 UTC.
- A GitHub Actions workflow pings `/api/health` every 5 minutes during West
  African hours to keep the Neon compute warm.
- Sentry is configured through `SENTRY_ORG`, `SENTRY_PROJECT`, and DSN variables.
- The app runs as a standalone Next.js output and exposes `/api/health`.

Environment-variable details and deployment caveats are maintained in
`docs/PRODUCTION.md`. Deployment is Vercel-only (no Docker required).
