# SLNews Current-State Inventory

Last reconciled against the tracked codebase on 2026-08-04. This file is the source of truth for documentation status; the numbered audit files are retained as historical inventories.

## Verified Implemented

- Database-backed market prices and announcements, including query-string filters.
- Market actions: DB-backed price alerts (create/remove per commodity+market) and a rate-limited price-report submission flow for review.
- Contributor following: DB-backed follow/unfollow with follower counts, plus author byline links from article pages.
- Announcement actions: notice detail pages and a functional Post Notice form.
- Dashboard and profile pages decomposed into focused components.
- Loading and error boundaries across the primary application routes.
- Article metadata, sitemap, robots rules, Open Graph image, and page metadata for the main content routes. Landing, auth, profile, saved, and password-reset routes now export route metadata (auth routes via layout files).
- DB-backed rate limiting for authentication, password reset, price reports, and push subscription; rate-limited search input.
- Structured logging, error-reporting helpers, Prisma connection retry logic, health check, security headers, PWA setup, Vitest, and Playwright configuration.
- Mobile search entry points in the header and drawer, data-driven market/announcement cards, shared bookmark controls, and centralized region constants.
- Accessibility: announcement card titles are real links with visible focus states; landing-page low-contrast footer text corrected; non-interactive commodity cards no longer imply clickability.
- Production-mode PWA verification: Playwright asserts the service worker registers in a production build.
- `.env.example` documents every runtime variable (`AUTH_SECRET`, `NEWS_API_KEY`, `SCRAPER_API_KEY`, VAPID, Sentry, etc.); `docs/PRODUCTION.md` and the README align with it.

## Open Product Work

| Priority | Item | Evidence |
|---|---|---|
| Low | Price-alert push delivery | Alerts are stored and manageable, but no scheduled job yet compares prices and pushes notifications to alert owners. |
| Low | Price-report moderation UI | Reports are stored with a `PENDING` status; editors have no review screen yet. |
| Low | Follow feed | Follows exist, but the home feed is not yet personalized by followed contributors. |
| Low | Test coverage reporting | `npm run test:coverage` works; no CI gate enforces a threshold. |

## Historical Audit Files

`01-hardcoded-content.md` through `10-dev-experience.md` capture the original audit and are not a live completion dashboard. Their task wording and checkmarks may predate later refactors. Use this file and the source code for current status.
