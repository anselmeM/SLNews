# 09 — Testing (4 tasks)

Set up test infrastructure and write initial tests.

## T-01: ✓ Set up unit test framework
- **File:** Created `vitest.config.ts`, `vitest.setup.ts`, `package.json` scripts
- **Issue:** No test framework, no test scripts, no test files
- **Fix:** Installed Vitest + @testing-library/react + @testing-library/jest-dom + @testing-library/user-event + jsdom
- **Done:** Created `vitest.config.ts` with jsdom env and path aliases; `vitest.setup.ts` with global mocks (next-auth, next/link, next/image, next/navigation, framer-motion, user-actions, feed-actions); added `test`/`test:run` scripts

## T-02: ✓ Write unit tests for utility functions
- **File:** `src/lib/__tests__/news-service.test.ts`
- **Tests written:**
  - `mapPrismaArticle()` — maps full article correctly
  - Falls back to province when district is null
  - Returns undefined location when both null
  - Uses default category 'National' when no categories
  - Falls back to '/globe.svg' when imageUrl is null
  - Uses 'SLNews Contributor' when author is null
  - Uses createdAt when publishedAt is null
  - Uses empty string when summary is null
- **Result:** 8/8 tests pass ✓

## T-03: ✓ Write component tests
- **Files:** `src/components/__tests__/`
- **Tests written:**
  - `ErrorFallback.test.tsx` — renders error + buttons, reset callback, Go Home link → 3/3 pass ✓
  - `NewsFeed.test.tsx` — empty state, featured card, all articles, Load More button visibility, custom icon, hide dividers → 7/7 pass ✓
- **Result:** 10/10 component tests pass ✓

## T-04: Set up E2E testing
- **File:** Missing entirely
- **Issue:** No end-to-end tests for user flows
- **Fix:** Install Playwright:
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```
  Create E2E tests for:
  - Login flow (credentials → home page)
  - Navigation (home → local → national → world)
  - Article view (click article → detail page)
  - Search flow (search term → results page)
  - Save/bookmark (toggle bookmark)
