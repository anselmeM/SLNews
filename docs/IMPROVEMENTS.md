# SLNews Improvement Roadmap

Prioritized improvement tasks to enhance developer experience, reader offline capabilities, automated push delivery, and market analytics.

---

## 1. Vitest Runner Tuning (Dev Experience)
**Goal:** Eliminate worker fork pool timeouts on Windows environments for fast, deterministic unit test runs.

- [x] Update `vitest.config.ts` pool options (`poolOptions: { forks: { singleFork: true } }` / `threads: false`).
- [x] Verify with `npm run test:run` (55/55 passed).

---

## 2. Automated Background Price-Alert Push Delivery
**Goal:** Trigger automated push notifications during cron sync when followed commodity prices fluctuate.

- [x] Verify `checkPriceAlerts()` in `src/app/api/cron/sync/route.ts` against `PriceAlert` thresholds.
- [x] Ensure rate-limiting and duplicate suppression (`lastNotifiedAt`).
- [x] Add unit test assertions in `src/lib/__tests__/price-alert-matcher.test.ts`.

---

## 3. Full Offline Reading & Caching Enhancement
**Goal:** Allow readers in low/no-connectivity areas to save and read full article bodies and media offline.

- [x] Ensure `useAppStore.ts` stores full article attributes (`content`, `paragraphs`, `summary`, `author`, `source`).
- [x] Update `/saved` reader view to render complete offline article content.
- [x] Add offline fallback routing in `article/[id]/error.tsx`.

---

## 4. Commodity Price Trend Charts on `/market`
**Goal:** Provide clear historical price visualization (7d/30d) for agricultural and energy commodities.

- [x] Create inline responsive SVG sparkline trend indicator inside `CommodityCard.tsx`.
- [x] Display trend indicators on `/market` commodity cards with data-saver fallback.

---

## 5. Web Speech API Integration for `ListenButton.tsx`
**Goal:** Enable native voice read-aloud for accessibility and hands-free news listening.

- [x] Connect `window.speechSynthesis` in `src/components/ListenButton.tsx` with play/pause/resume/stop controls.
- [x] Gracefully handle browser capability fallbacks and unmount cancellation.
- [x] Add unit test in `src/components/__tests__/ListenButton.test.tsx` (3/3 passed).

---

## 6. Dynamic Reading Time Estimation
**Goal:** Calculate accurate read times across feeds and reader view based on actual article length (~200 wpm standard).

- [x] Create `src/lib/reading-time.ts` utility function.
- [x] Add unit tests in `src/lib/__tests__/reading-time.test.ts` (3/3 passed).
- [x] Integrate reading time in `ArticleCard.tsx`, `FeaturedArticleCard.tsx`, `SwipeableCard.tsx`, and `/article/[id]/page.tsx`.

---

## 7. Reader Font Sizing Preferences
**Goal:** Provide custom text sizing (`1x`, `1.2x`, `1.4x`) for enhanced reader comfort and accessibility.

- [x] Add `fontSize` (`normal` / `large` / `xlarge`) to `useAppStore.ts`.
- [x] Create `TextSizeSelector.tsx` toggle component.
- [x] Apply dynamic font styling in `ArticleBody.tsx`.

---

## 8. Real-Time Offline Network Status Banner
**Goal:** Detect when internet connectivity drops and inform the reader that cached content and saved stories remain available.

- [x] Create `NetworkStatusBar.tsx` listening to `navigator.onLine` and `online`/`offline` window events.
- [x] Mount `NetworkStatusBar` in `AppLayoutWrapper.tsx`.

---

## 9. Search Query Highlighting
**Goal:** Highlight matched keywords in search result article titles for fast scanning.

- [x] Create `HighlightText.tsx` component with case-insensitive token highlighting.
- [x] Add unit tests in `src/components/__tests__/HighlightText.test.tsx` (3/3 passed).
- [x] Connect `highlightQuery` prop to `NewsFeed`, `SwipeableCard`, and `/search/page.tsx`.

---

## 10. Community Announcements & Classifieds Polish
**Goal:** Expand `/announcements` with structured categories (`Jobs`, `Real Estate`, `Public Notices`, `Events`) and one-tap WhatsApp / Call contact buttons.

- [x] Create Sierra Leone phone normalization & WhatsApp link generator in `src/lib/contact-utils.ts`.
- [x] Add unit tests in `src/lib/__tests__/contact-utils.test.ts` (6/6 passed).
- [x] Expand category list and icon mappings in `src/lib/announcement-constants.ts`.
- [x] Update `PostNoticeForm.tsx` to support classifieds categories and optional contact phone.
- [x] Add one-tap WhatsApp and Call buttons on `AnnouncementCard.tsx` and `/announcements/[id]/page.tsx`.

---

## 11. Rich Social Share Cards & OpenGraph Generator
**Goal:** Enhance dynamic share cards (`/api/share-card`) with Sierra Leone tri-color branding, bold typography, category pills, and source attribution badges.

- [x] Redesign 1200x630 vector share card in `src/app/api/share-card/route.ts`.
- [x] Add unit tests in `src/lib/__tests__/share-card.test.ts` (2/2 passed).
- [x] Update `/article/[id]/page.tsx` OpenGraph and Twitter card metadata with dynamic share card fallback.

---

## Verification Suite
Before completing changes:
```bash
npm run lint
npm run test:run
npx tsc --noEmit
npm run build
```

