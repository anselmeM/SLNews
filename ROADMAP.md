# SLNews Production Roadmap

## High Priority — Bugs & Reliability

### 1. Fix article not-found returning HTTP 200 instead of 404
**File:** `src/app/article/[id]/page.tsx`
`notFound()` renders the not-found page content but the HTTP status is 200. Check Next.js 16 not-found behavior; may need a middleware or `not-found.tsx` at the route level.

### 2. Add Neon DB connection retry logic
**File:** `src/lib/db.ts`
Neon serverless cold starts cause intermittent connection timeouts (500s). Add retry logic to the Prisma client or pool configuration. Options: `pg` pool `max: 20` with `connectionTimeoutMillis: 10_000` + retry wrapper in `db.ts`.

### 3. Add Content-Security-Policy header
**File:** `next.config.ts`
Add CSP header to prevent XSS. Start with:
```
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline' fonts.googleapis.com; 
img-src 'self' data: https:; font-src 'self' fonts.gstatic.com; 
connect-src 'self' https://*.vercel.app https://*.neon.tech;
```

### 4. Add loading.tsx to missing pages
**Files to create:**
- `src/app/article/[id]/loading.tsx` — shimmer skeleton for article body
- `src/app/world/loading.tsx` — shimmer feed fallback
- `src/app/saved/loading.tsx` — shimmer feed fallback
- `src/app/profile/loading.tsx` — shimmer profile skeleton

All should use the existing `ShimmerFeed` and `ShimmerBar` components.

### 5. Add error.tsx boundaries at route level
**Files to create:**
- `src/app/article/[id]/error.tsx` — catch DB failures on article detail
- `src/app/news/error.tsx` — catch DB failures on news feed

Both should show a friendly error with a retry button.

---

## Medium Priority — Polish & Security

### 6. Client-side input validation on register/login forms
**Files:** `src/app/login/page.tsx`, `src/app/register/page.tsx`
- Validate email format before submit
- Enforce password strength (min 6 chars, at least 1 letter + 1 number)
- Show inline validation errors before form submission

### 7. Convert /world category filters to client-side tabs
**File:** `src/app/world/page.tsx`
Currently uses server-navigation `<Link>` components for category tabs — same issue `/news` had before. Convert to `TabFilters` pattern with `startTransition` for smooth switching.

### 8. Wire up world page with InstantSearch and shimmer
**File:** `src/app/world/page.tsx`
- Add `InstantSearch` component (world search)
- Replace `animate-pulse` fallbacks with `ShimmerFeed`
- Add `LatestStories` horizontal strip if applicable

### 9. Rate limiting on auth and push API routes
**Files:**
- `src/app/api/auth/[...nextauth]/route.ts` — re-add IP-based rate limiting on POST (was removed earlier)
- `src/app/api/push/subscribe/route.ts` — add rate limiting (max 5 subscribes/min per IP)

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

### 12. App screenshots in manifest for PWA install dialog
**File:** `public/manifest.json`
Add a `screenshots` array with actual screenshots of the app (home feed, article view, dark mode). Sizes: 1080×1920 or similar. Enhances the install prompt UI on Android.

```json
"screenshots": [
  {
    "src": "/screenshots/home-light.png",
    "sizes": "1080x1920",
    "type": "image/png",
    "form_factor": "narrow",
    "label": "Home feed"
  }
]
```

### 13. Add meta description tags to all pages
**Files:** Various page.tsx files
Ensure every route exports a `metadata` object with at minimum `title` and `description`. Check: `/world`, `/saved`, `/profile`, `/profile/edit`, `/forgot-password`, `/reset-password`, `/dashboard`.

### 14. Write Playwright e2e tests
**Directory:** `e2e/` or `tests/`
Critical flows to cover:
- `register.spec.ts` — register new user, verify redirect to /home
- `login.spec.ts` — login existing user, verify session
- `browse.spec.ts` — tap through categories, open article
- `search.spec.ts` — search for article, see results
- `save.spec.ts` — bookmark article, verify it appears in Saved
- `datasaver.spec.ts` — toggle data saver, verify images hidden
- `pwa.spec.ts` — verify manifest loads, SW registers
