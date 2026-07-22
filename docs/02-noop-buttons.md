# 02 — No-Op Buttons & Controls (19 tasks — ALL COMPLETE ✓)

> Historical audit inventory. The “all complete” heading is stale: market actions, notice actions, and contributor following remain intentional “coming soon” placeholders. See `TODO.md`.

Wire up controls that currently do nothing when clicked.

## N-01: ✓ Dashboard — Draft save alert
- **File:** `src/app/dashboard/_components/DashboardClient.tsx:87`
- **Issue:** `alert("Draft saved successfully!")` — browser-native popup
- **Fix:** Replaced with Toast notification system (`src/components/Toast.tsx`)
- **File:** `src/app/dashboard/_components/DashboardClient.tsx:87`
- **Issue:** `alert("Draft saved successfully!")` — browser-native popup
- **Fix:** Replace with toast notification component

## N-02: Market — "Set Alert" button
- **File:** `src/app/market/page.tsx:27-28`
- **Issue:** No `onClick`
- **Fix:** Open modal or navigate to alert setup page

## N-03: Market — "Set Price Alerts" button
- **File:** `src/app/market/page.tsx:165-167`
- **Issue:** No handler
- **Fix:** Same as N-02

## N-04: Market — "Report Price Change" button
- **File:** `src/app/market/page.tsx:168-170`
- **Issue:** No handler
- **Fix:** Open report form or navigate

## N-05: Market — Tab buttons
- **File:** `src/app/market/page.tsx:17-21`
- **Issue:** Clicking tabs doesn't switch content
- **Fix:** Make tabs functional with useState or searchParams

## N-06: Announcements — Region select dropdown
- **File:** `src/app/announcements/page.tsx:19-25`
- **Issue:** No `onChange` handler, no state
- **Fix:** Wire up to filter notices by province

## N-07: Announcements — Category filter chips
- **File:** `src/app/announcements/page.tsx:32-37`
- **Issue:** No `onClick` handlers, no active state
- **Fix:** Make chips toggle or navigate with searchParams

## N-08: Announcements — "Read Full Notice" buttons (x3)
- **File:** `src/app/announcements/page.tsx:69-72, 99-103, 130-133`
- **Issue:** No `href`/`onClick`
- **Fix:** Link to notice detail page or expand inline

## N-09: Announcements — "Post Notice" FAB
- **File:** `src/app/announcements/page.tsx:140-143`
- **Issue:** No handler
- **Fix:** Navigate to notice creation form

## N-10: About — "Report an Error" button
- **File:** `src/app/about/page.tsx:130-133`
- **Issue:** No handler
- **Fix:** Link to contact form or email

## N-11: Profile — "Edit Profile" button
- **File:** `src/app/profile/page.tsx:55-57`
- **Issue:** No handler
- **Fix:** Open edit modal or navigate to edit page

## N-12: Profile — "Manage" regions button
- **File:** `src/app/profile/page.tsx:99`
- **Issue:** No handler
- **Fix:** Open region selection UI

## N-13: Profile — "+" add region button
- **File:** `src/app/profile/page.tsx:109-111`
- **Issue:** No handler
- **Fix:** Open region picker

## N-14: Profile — Region chip remove (close icon)
- **File:** `src/app/profile/page.tsx:103-107`
- **Issue:** No `onClick` on the close icon
- **Fix:** Call `toggleTopic` or remove region from user preferences

## N-15: Profile — Notification toggles
- **File:** `src/app/profile/page.tsx:128-130, 141-143`
- **Issue:** No `onChange` handlers, not synced to backend
- **Fix:** Add to user preferences model

## N-16: ✓ Article — Bookmark button
- **File:** `src/app/article/[id]/page.tsx:65-66`
- **Issue:** Server component — `handleBookmark` is undefined
- **Fix:** Created `src/components/ArticleActions.tsx` client component with working bookmark + share
- **File:** `src/app/article/[id]/page.tsx:65-66`
- **Issue:** Server component — `handleBookmark` is undefined
- **Fix:** Make bookmark section a client component wrapper

## N-17: ✓ Article — Share button
- **File:** `src/app/article/[id]/page.tsx:68-69`
- **Issue:** No handler
- **Fix:** Web Share API with clipboard fallback in `ArticleActions.tsx`
- **File:** `src/app/article/[id]/page.tsx:68-69`
- **Issue:** No handler
- **Fix:** Use Web Share API or copy link

## N-18: Author — "Follow" button
- **File:** `src/app/author/[id]/page.tsx:61-63`
- **Issue:** No handler
- **Fix:** Create follow relationship in DB

## N-19: ✓ Local page — District chip buttons
- **File:** `src/app/local/page.tsx:62-63`
- **Issue:** No `onClick`, not wrapped in `<Link>`
- **Fix:** District chips now wrap in `<Link>` with `?province=&district=` searchParams
- **File:** `src/app/local/page.tsx:62-63`
- **Issue:** No `onClick`, not wrapped in `<Link>`
- **Fix:** Make district chips filter via searchParams
