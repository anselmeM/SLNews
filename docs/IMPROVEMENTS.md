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

## Verification Suite
Before completing changes:
```bash
npm run lint
npm run test:run
npx tsc --noEmit
npm run build
```
