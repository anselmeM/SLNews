# SLNews Feature Tasks

Checklist of prioritized features to build. Each task lists the files that already exist and can be reused. Mark boxes `[x]` as items are completed.

Legend: files referenced are under `src/` unless noted.

---

## 1. Push delivery for price alerts

**Goal:** Notify users when a commodity price moves in a market they follow.

- [x] Add a price-check step to `app/api/cron/sync/route.ts` (or a new `checkPriceAlerts` function in `app/actions/market-actions.ts`):
  - [x] Compare fresh `MarketPrice` rows against stored `PriceAlert` rows (`commodity` + `market` match).
  - [x] Track last-notified state to avoid duplicate pings (`lastNotifiedAt` on `PriceAlert`).
  - [x] Reuse `sendPushNotifications` (`app/actions/push-actions.ts`) with per-user targeting via `PushSubscription.userId` and `PriceAlert.userId`.
- [x] Surface alert status in the market UI (`app/market/_components/MarketActions.tsx`): "We'll ping you when this price changes".
- [x] Add a unit test for the alert-matching logic (pure function, no DB).

**Implementation:** `lib/price-alert-matcher.ts` (pure matcher), `lib/price-alert-service.ts` (orchestrates fetch → match → per-user push → `lastNotifiedAt` update), `app/api/cron/sync/route.ts` now reports `priceAlerts` in its response, `sendPushNotifications` accepts `{ userId, userIds }` filters, unit tests in `lib/__tests__/price-alert-matcher.test.ts`.

**Done when:** a user with an active alert receives a push when the cron run sees a price change; duplicates are suppressed.

---

## 2. Price-report moderation screen

**Goal:** Editors can approve or reject `PENDING` price reports; approval updates the market price.

- [x] Add `getPendingPriceReports` + `reviewPriceReport(id, "APPROVED" | "REJECTED")` actions in `app/actions/market-actions.ts` (role-gated to EDITOR/ADMIN).
  - [x] Approve: `upsert` the matching `MarketPrice` row (`commodity` + `market`), compute `trend`/`trendPct` vs the current price, set report status `APPROVED`, invalidate `market:*` cache.
  - [x] Reject: set status `REJECTED`.
- [x] Build a "Price Reports" panel (`app/dashboard/_components/PriceReportPanel.tsx`) with approve/reject buttons.
- [x] Rate-limit review actions with `checkDbRateLimit` (`lib/rate-limiter.ts`).
- [x] Page at `/dashboard/reports` + link from `/dashboard` for moderators.

**Done when:** a report submitted via the market page appears in the dashboard and an editor's approval updates the displayed price.

---

## 3. Follow-personalized feed

**Goal:** Surface articles from followed contributors on the home page.

- [x] In `lib/news-service.ts`: `fetchFollowingNews(userId, skip, take)` — queries `Follow` rows for the signed-in user, then fetches `Article`s where `authorId` matches (`published` + `status: "PUBLISHED"`).
- [x] Add a "From people you follow" section in `app/home/_components/FollowingFeed.tsx` (server component; renders nothing when signed out or no follows).
- [x] Cache with `cachedFetch` (`following:{userId}:...`) and invalidate `following:` in `app/actions/follow-actions.ts` on toggle.
- [x] Section header + per-article bylines link to `/author/[id]`.

**Done when:** following a contributor adds their recent articles to the home feed.

---

## 4. Comments on announcements

**Goal:** Community notices support public discussion.

- [x] New `AnnouncementComment` model (kept separate from article `Comment`).
- [x] API route `app/api/announcements/[id]/comments/route.ts`: GET list (public) + POST create (auth-required, max 2000 chars, rate-limited 20/hr via `checkDbRateLimit`).
- [x] Add a comment section (`app/announcements/[id]/_components/AnnouncementComments.tsx`) to the notice detail page.
- [x] Signed-out users see a "Sign in to leave a comment" prompt.

**Done when:** signed-in users can comment on a notice and others see the thread.

---

## 5. Search filters

**Goal:** Narrow search by category, province, and date.

- [x] Extend `searchArticles` in `lib/news-service.ts` with `SearchFilters` (`category` / `province` / `dateFrom`) applied at the DB level.
- [x] Add filter chips to `app/search/page.tsx`: category (fixed to match real DB categories, incl. "Tech"), province (5 regions), and period (24h / 7d / 30d), all wired into the query string.
- [x] Kept the in-memory rate limit on `search:{ip}`.

**Done when:** filtering by category or province returns scoped results and updates the URL.

---

## 6. WhatsApp share

**Goal:** One-tap share to WhatsApp, the dominant messenger in the market.

- [x] In `app/article/[id]/_components/ShareSheet.tsx`, added a WhatsApp option:
  - `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`
- [ ] (Optional, skipped) Gate behind Data Saver — the share sheet is already an explicit user action, no extra gating needed.

**Done when:** tapping WhatsApp in the share sheet opens a pre-filled WhatsApp chat.

---

## 7. Morning briefing push

**Goal:** Daily digest of top stories sent via push at cron time.

- [x] `lib/briefing-service.ts`: `sendMorningBriefing()` composes a brief from the top 3 `fetchMixedHomeFeed` articles and pushes only to opted-in users.
- [x] `sendPushNotifications` now supports `{ userIds }` targeting by `PushSubscription.userId`.
- [x] Opt-in toggle "Morning Briefing" on `/profile` (`dailyBriefing Boolean @default(false)` on `User`, set via `setDailyBriefing` in `app/actions/user-actions.ts`).
- [x] Wired into `app/api/cron/sync/route.ts` (runs at the existing 06:30 cron), reported as `briefing` in the response.

**Done when:** opted-in users receive one push per day with a digest title/body pointing at `/home`.

---

## 8. Rate-limit login attempts

**Goal:** Harden the credentials sign-in against brute force.

- [x] `checkDbRateLimit` on `login:{ip}:{email}` (5 attempts / 15 min) in the `authorize` callback of `src/auth.ts`; counter resets on successful login via `resetRateLimit`.
- [x] Friendly error: login page calls `getLoginRateLimitStatus(email)` (`app/actions/auth-actions.ts`) on failure and shows "Too many sign-in attempts. Please try again later." without leaking whether the account exists.
- [x] `app/api/health/route.ts` already prunes expired `RateLimit` rows.

**Done when:** repeated failed logins are blocked with a clear message and the existing e2e login tests still pass.

---

## 9. Organization / NewsMedia structured data

**Goal:** Better Google results with JSON-LD.

- [x] `NewsMediaOrganization` JSON-LD on the landing page (`app/page.tsx`).
- [x] `NewsArticle` JSON-LD on `app/article/[id]/page.tsx` (headline, description, image, dates, author, publisher, `mainEntityOfPage`).
- [x] Serialized with `JSON.stringify` + `dangerouslySetInnerHTML` (static data only); absolute URLs via `lib/site-url.ts` (`NEXT_PUBLIC_SITE_URL`).

**Done when:** `/` and article pages emit valid JSON-LD (validate via Google Rich Results test).

---

## 10. Inline follow on article pages

**Goal:** Make following discoverable where readers already are.

- [x] `FollowButton` (`components/FollowButton.tsx`) gained a `variant="compact"` chip (no follower count, smaller padding) and a `callbackPath` prop for login redirects.
- [x] Article page byline shows the compact Follow chip when `authorId` exists and the reader isn't the author (initial state from `getFollowState`).

**Done when:** readers can follow a contributor directly from any of their articles.

---

## Verification (run before marking the task complete)

```bash
npm run lint        # 0 errors
npm run test:run    # all unit tests pass
npm run test:e2e    # all Playwright tests pass
npm run build       # production build succeeds
```

Current status: lint 0 errors, 39/39 unit tests, 29/29 e2e tests, production build succeeds.

Prisma schema changes: `npx prisma db push` (dev) — remember to also run `npx prisma generate` before `npm run build`.
