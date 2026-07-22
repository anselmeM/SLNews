# SLNews Current-State Inventory

Last reconciled against the tracked codebase on 2026-07-21. This file is the source of truth for documentation status; the numbered audit files are retained as historical inventories.

## Verified Implemented

- Database-backed market prices and announcements, including query-string filters.
- Dashboard and profile pages decomposed into focused components.
- Loading and error boundaries across the primary application routes.
- Article metadata, sitemap, robots rules, Open Graph image, and page metadata for the main content routes.
- DB-backed rate limiting for authentication, password reset, and push subscription; rate-limited search input.
- Structured logging, error-reporting helpers, Prisma connection retry logic, health check, security headers, PWA setup, Vitest, and Playwright configuration.
- Mobile search entry points in the header and drawer, data-driven market/announcement cards, shared bookmark controls, and centralized region constants.

## Open Product Work

| Priority | Item | Evidence |
|---|---|---|
| High | Repair legacy redirects | `next.config.ts` redirects `/local` and `/national` to nonexistent `/news`. |
| High | Align environment documentation | `.env.example` uses `NEXTAUTH_SECRET` and `MEDIASTACK_API_KEY`; runtime also reads `NEWS_API_KEY`, `SCRAPER_API_KEY`, and Sentry variables. |
| Medium | Implement market actions | Price alert and price-report controls intentionally show “coming soon.” |
| Medium | Implement announcement actions | Notice detail and notice-posting controls intentionally show “coming soon.” |
| Medium | Implement contributor following | The author follow control intentionally shows “coming soon.” |
| Medium | Complete accessibility review | Market and announcement cards are presentational `div`s; contrast has not been independently audited. |
| Low | Add route metadata where absent | Landing, auth, profile, saved, and password-reset pages rely on root or layout metadata. |
| Low | Decide public-route policy | `proxy.ts` currently protects pages such as market, announcements, and about. |

## Historical Audit Files

`01-hardcoded-content.md` through `10-dev-experience.md` capture the original audit and are not a live completion dashboard. Their task wording and checkmarks may predate later refactors. Use this file and the source code for current status.
