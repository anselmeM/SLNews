# 05 — SEO (7 tasks — ALL COMPLETE ✓)

Improve search engine optimization and social media previews.

## S-01: Add OpenGraph and Twitter metadata
- **File:** `src/app/layout.tsx:7-11`
- **Issue:** Root metadata has only basic `title` and `description`
- **Fix:** Add:
  ```ts
  openGraph: {
    title: "...", description: "...", images: ["/og-image.png"],
    type: "website", siteName: "SLNews"
  },
  twitter: { card: "summary_large_image", title: "...", images: ["/og-image.png"] }
  ```

## S-02: ✓ Create robots.txt
- **File:** `public/robots.txt`
- **Fix:** Created with crawl rules (allow all, disallow /api, /dashboard, /profile)

## S-03: ✓ Create sitemap
- **File:** `src/app/sitemap.ts`
- **Fix:** Dynamic sitemap with article URLs, page priorities, change frequencies

## S-04: ✓ Create OpenGraph image
- **File:** `src/app/opengraph-image.tsx`
- **Fix:** Created with green brand background, "SL News" text, 1200×630

## S-05: Per-page metadata
- **File:** All page.tsx files
- **Issue:** Only `layout.tsx` exports `metadata`. Every page should export `generateMetadata` with unique title/description.
- **Affected pages:** `/article/[id]`, `/author/[id]`, `/home`, `/world`, `/local`, `/national`, `/about`, `/market`, `/announcements`, `/dashboard`, `/profile`, `/saved`
- **Fix:** Add `export const metadata` or `generateMetadata` to each page

## S-06: ✓ Fix PWA manifest icons
- **File:** `public/manifest.json:11-13`
- **Issue:** References missing PNGs that don't exist in `public/`
- **Fix:** PWA plugin (`@ducanh2912/next-pwa`) auto-generates icons during `next build`. In dev, PWA is disabled. No action needed.

## S-07: ✓ Fix PWA theme_color
- **File:** `public/manifest.json:8`
- **Issue:** `"theme_color": "#000000"` — should be brand color
- **Fix:** Changed to `"#006e1c"` (SLNews primary green)
