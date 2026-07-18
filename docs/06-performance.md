# 06 — Performance (8 tasks — ALL COMPLETE ✓)

Improve loading speed, Core Web Vitals, and perceived performance.

## P-01: ✓ Add loading.tsx to all route segments
- **File:** Missing in all route directories
- **Issue:** Every page blocks rendering until server data is fully fetched. No Suspense or streaming.
- **Fix:** Create `loading.tsx` in each route segment with a skeleton/spinner:
  - `src/app/loading.tsx`
  - `src/app/home/loading.tsx`
  - `src/app/national/loading.tsx`
  - `src/app/local/loading.tsx`
  - `src/app/world/loading.tsx`
  - `src/app/search/loading.tsx`
  - `src/app/article/[id]/loading.tsx`
  - `src/app/dashboard/loading.tsx`
  - `src/app/saved/loading.tsx`
  - `src/app/author/[id]/loading.tsx`

## P-02: Add Suspense boundaries
- **File:** All pages with async data fetching
- **Issue:** No usage of `<Suspense>` anywhere
- **Fix:** Wrap data-fetching components in `<Suspense fallback={<Loader/>}>`

## P-03: ✓ Priority on above-the-fold images
- **File:** `src/app/article/[id]/page.tsx:77-83`
- **Issue:** Hero image has no `priority` attribute — affects LCP
- **Fix:** Add `priority` attribute to hero/featured images

## P-04: ✓ Priority on featured article images
- **File:** `src/components/FeaturedArticleCard.tsx:32-37`
- **Issue:** Featured image at top of page has no `priority`
- **Fix:** Add `priority` attribute

## P-05: ✓ Add sizes attribute to images
- **File:** `src/components/ArticleCard.tsx:33-38`, `src/components/FeaturedArticleCard.tsx:32-37`
- **Issue:** All `<Image>` components lack `sizes` attribute
- **Fix:** Add appropriate `sizes` for responsive image loading

## P-06: ✓ Migrate Google Fonts to next/font
- **File:** `src/app/layout.tsx:23-40`
- **Issue:** Fonts loaded via `<link>` tags — external render-blocking request
- **Fix:** Use `next/font/google` with `Inter` — provides self-hosting, subset optimization, and font-display:swap

## P-07: ✓ Remove unused imports (author page)
- **File:** `src/app/author/[id]/page.tsx:2`
- **Issue:** Imports `Image from "next/image"` but never uses it
- **Fix:** Remove unused import

## P-08: ✓ Remove unused imports (DashboardClient)
- **File:** `src/app/dashboard/_components/DashboardClient.tsx:7`
- **Issue:** Imports `AnimatePresence` from framer-motion but never uses it
- **Fix:** Remove unused import
