# SLNews Production Roadmap

## High Priority — Bugs & Reliability

### 1. Fix article not-found returning HTTP 200 instead of 404 ✅
**File:** `src/app/article/[id]/not-found.tsx` (added), `src/app/article/[id]/page.tsx`

### 2. Add Neon DB connection retry logic ✅
**File:** `src/lib/db.ts`
Added `keepAlive: true`, increased `idleTimeoutMillis: 60_000`, `connectionTimeoutMillis: 15_000`, pool error handler.

### 3. Add Content-Security-Policy header ✅
**File:** `next.config.ts`

### 4. Add loading.tsx to missing pages ✅
- `src/app/article/[id]/loading.tsx`
- `src/app/world/loading.tsx`
- `src/app/saved/loading.tsx`
- `src/app/profile/loading.tsx`

### 5. Add error.tsx boundaries at route level ✅
- `src/app/article/[id]/error.tsx`
- `src/app/news/error.tsx`

---

## Medium Priority — Polish & Security

### 6. Client-side input validation on register/login forms ✅
**Files:** `src/app/login/page.tsx`, `src/app/register/page.tsx`

### 7. Convert /world category filters to client-side tabs ✅
**File:** `src/app/world/page.tsx`, `src/app/world/_components/WorldTabFilters.tsx`

### 8. Wire up world page with InstantSearch and shimmer ✅
**File:** `src/app/world/page.tsx`

### 9. Rate limiting on auth and push API routes ✅
**Files:** `src/app/api/push/subscribe/route.ts` (already on auth)

### 10. Error monitoring (Sentry or Vercel Analytics)
**Options:**
- **Sentry:** `@sentry/nextjs` — captures server + client errors, release tracking
- **Vercel Analytics:** built-in, free, shows web vitals + page views
- Both can run side-by-side

### 11. Submit sitemap to search engines
- Submit `https://sl-news.vercel.app/sitemap.xml` to [Google Search Console](https://search.google.com/search-console)
- Submit to [Bing Webmaster Tools](https://www.bing.com/webmasters)
- Verify domain ownership via DNS or HTML file

---

## Low Priority — Nice-to-Have

### 12. App screenshots in manifest for PWA install dialog ✅
**File:** `public/manifest.json`, `public/screenshots/home-light.png`

### 13. Add meta description tags to all pages for SEO ✅
**Files:** `src/app/saved/layout.tsx`, `src/app/profile/layout.tsx`, `src/app/profile/edit/layout.tsx`

### 14. Write Playwright e2e tests ✅
**File:** `e2e/critical-flows.spec.ts`
Covers: home load, bottom nav, hamburger drawer, search, news filters, world page, manifest, service worker.
