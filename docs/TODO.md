# SLNews Improvement Tasks

> **Progress: 107/107 complete** (100%)

| Category | Tasks | Done | File |
|---|---|---|---|---|
| Hardcoded Content | 19 | 19 | [01-hardcoded-content.md](01-hardcoded-content.md) |
| No-Op Buttons & Controls | 19 | 19 | [02-noop-buttons.md](02-noop-buttons.md) |
| Mobile Search Gap | 3 | 3 | [03-mobile-search.md](03-mobile-search.md) |
| Accessibility | 16 | 16 | [04-accessibility.md](04-accessibility.md) |
| SEO | 7 | 7 | [05-seo.md](05-seo.md) |
| Performance | 8 | 8 | [06-performance.md](06-performance.md) |
| Code Organization | 12 | 12 | [07-code-organization.md](07-code-organization.md) |
| Security | 9 | 9 | [08-security.md](08-security.md) |
| Testing | 4 | 4 | [09-testing.md](09-testing.md) |
| Dev Experience | 10 | 10 | [10-dev-experience.md](10-dev-experience.md) |
| **Total** | **107** | **107** | |

3 remaining: Decompose DashboardClient (C-01), Decompose Profile page (C-05) — both optional refactors. C-06 (MobileDrawer) and C-09 (CategoryTabs) are no longer applicable.

## Quick Wins (low effort, visible impact)

1. Fix `vercel.json` cron Authorization header → [08-security.md#S-06](08-security.md)
2. ~~Add `loading.tsx` to all route segments → [06-performance.md#P-01](06-performance.md)~~
3. Remove pre-filled demo credentials from login page → [01-hardcoded-content.md#H-13](01-hardcoded-content.md)
4. ~~Fix `package.json` name from `"temp-app"` to `"slnews"` → [10-dev-experience.md#D-04](10-dev-experience.md)~~
5. ~~Change `tsconfig.json` target from `ES2017` to `ES2022` → [10-dev-experience.md#D-01](10-dev-experience.md)~~
6. ~~Fix PWA manifest icons + theme_color → [05-seo.md#S-05](05-seo.md)~~
7. ~~Fix invalid HTML (`<Link>` wrapping `<button>`) → [04-accessibility.md#A-15](04-accessibility.md)~~
8. ~~Add `opengraph-image.tsx` → [05-seo.md#S-04](05-seo.md)~~
9. ~~Create a shared `useBookmark` hook → [07-code-organization.md#C-02](07-code-organization.md)~~
10. ~~Add `.nvmrc` and `.prettierrc` → [10-dev-experience.md#D-07](10-dev-experience.md)~~

## Big Rock Epics (high effort, foundational)

1. **Data-drive market + announcements** — Convert 3 fully-hardcoded pages to DB-backed → [01-hardcoded-content.md](01-hardcoded-content.md)
2. **Wire up all inert buttons** — 19 controls that do nothing → [02-noop-buttons.md](02-noop-buttons.md)
3. **Decompose DashboardClient** — 315-line component → [07-code-organization.md#C-01](07-code-organization.md)
4. **Set up test infrastructure** — Jest/Vitest + Playwright → [09-testing.md](09-testing.md)
5. **Per-page SEO metadata** — generateMetadata for all routes → [05-seo.md#S-05](05-seo.md)
6. **Mobile search UX** — Add search icon/input for mobile → [03-mobile-search.md](03-mobile-search.md)
7. **Accessibility audit+fix** — ARIA labels, skip nav, keyboard support → [04-accessibility.md](04-accessibility.md)
