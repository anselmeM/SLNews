# SLNews Production Roadmap

## Status: Production Ready ✅

All critical, medium, and low priority tasks complete.

---

## Completed Tasks

### High Priority — Bugs & Reliability

- **#1** Article not-found → force-dynamic, try/catch on fetch, `robots: noindex` meta. HTTP 200 soft-404 is a Next.js 16 dynamic-route bug. UI renders correct 404 page, SEO safe.
- **#2** Neon retry → `keepAlive: true`, 15s connect / 60s idle timeouts, pool error handler, `withRetry()` exponential backoff in `db.ts`.
- **#3** CSP → full Content-Security-Policy in `next.config.ts`.
- **#4** Loading states → shimmer skeletons on article, world, saved, profile pages.
- **#5** Error boundaries → `error.tsx` on article + news routes with retry button.

### Medium Priority — Polish & Security

- **#6** Form validation → email regex + password strength checks client-side (login + register).
- **#7** World tabs → client-side `TabFilters` with `startTransition` (matches /news pattern).
- **#8** World shimmer → `ShimmerFeed` fallback on world page.
- **#9** Rate limiting → push subscribe (5/min/IP), auth (10/min/IP).

### Low Priority — Nice-to-Have

- **#12** PWA screenshots → generated PNG referenced in manifest.json.
- **#13** SEO metadata → layout files for saved, profile, profile/edit pages.
- **#14** E2E tests → 7 Playwright test cases in `e2e/critical-flows.spec.ts`.

---

## Deployed Features

| Feature | Status |
|---|---|
| Mobile-first UI (bottom nav, drawer, shrink header) | ✅ |
| PWA installable (Android + iOS) | ✅ |
| Push notifications (Web Push) | ✅ |
| Offline support (service worker) | ✅ |
| Data saver mode | ✅ |
| Text-to-speech (Web Speech API) | ✅ |
| Reading progress bar | ✅ |
| Instant search (debounced, trending) | ✅ |
| Auto-refresh feed | ✅ |
| Swipe gestures (save/share) | ✅ |
| Haptic feedback | ✅ |
| Shimmer skeletons | ✅ |
| Bottom sheets | ✅ |
| Long-press context menus | ✅ |
| Sticky action bar | ✅ |
| Error monitoring (Sentry) | ✅ Configured — add `SENTRY_DSN` env var to activate |
| Branded share cards | ✅ |
| Drop-cap article body | ✅ |

---

## Vercel Env Vars

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | NextAuth session signing |
| `CRON_SECRET` | Cron sync endpoint authentication |
| `NEWS_API_KEY` | Currents API (world news) |
| `SCRAPER_API_KEY` | Sierra Leone scraper API |
| `SENTRY_DSN` | Optional: Sentry error monitoring |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional: client-side Sentry |

---

## Cron Schedule

`30 6 * * *` (once daily at 6:30 AM UTC — Vercel Hobby plan limit)
