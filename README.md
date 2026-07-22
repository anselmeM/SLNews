# SLNews

SLNews is a Sierra Leone news progressive web app built with Next.js, React, Prisma, PostgreSQL, and Auth.js. It provides news feeds, article reading, search, saved stories, community announcements, market prices, contributor tools, and optional web-push notifications.

## Current Routes

- `/` — landing page
- `/home` — personalized news feed
- `/local-news` — local coverage
- `/world` — international coverage
- `/search` — search
- `/article/[id]` — article detail, comments, reactions, and sharing
- `/market` and `/announcements` — database-backed community data
- `/saved`, `/profile`, and `/dashboard` — authenticated areas

The legacy redirects for `/local` and `/national` currently target `/news`, which is not a route. See `docs/TODO.md` before relying on those legacy URLs.

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and provide `DATABASE_URL` plus `NEXTAUTH_SECRET`. Optional sync features use `NEWS_API_KEY` (or the legacy `MEDIASTACK_API_KEY`), `SCRAPER_API_KEY`, and `CRON_SECRET`.

## Verification

```bash
npm run lint
npm run test:run
npm run test:e2e
npm run build
```

Read `docs/TODO.md` for the verified current-state inventory and `docs/PRODUCTION.md` for operational requirements.
