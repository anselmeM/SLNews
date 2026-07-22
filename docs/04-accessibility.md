# 04 — Accessibility (16 tasks)

> Historical audit inventory. Several findings were addressed in later components, but interactive card semantics and a contrast audit remain open. See `TODO.md`.

Fix WCAG compliance and accessibility issues.

## A-01: ArticleCard — Add aria-label to Link
- **File:** `src/components/ArticleCard.tsx:28-62`
- **Issue:** `<Link>` wrapping article content has no `aria-label`
- **Fix:** Add `aria-label={article.title}` or `aria-labelledby`

## A-02: FeaturedArticleCard — Add aria-label to Link
- **File:** `src/components/FeaturedArticleCard.tsx:28-63`
- **Issue:** Same as A-01
- **Fix:** Same as A-01

## A-03: ✓ Profile — Descriptive alt text on avatar
- **File:** `src/app/profile/page.tsx:42`
- **Issue:** `alt="Profile"` — not descriptive
- **Fix:** Use session user's name

## A-04: ✓ Article — Descriptive alt text on author avatar
- **File:** `src/app/article/[id]/page.tsx:49`
- **Issue:** `alt="Author"` — not descriptive
- **Fix:** Use `{article.source} avatar`

## A-05: ✓ Login — aria-label on submit button
- **File:** `src/app/login/page.tsx:93-95`
- **Issue:** No `aria-label` on submit button
- **Fix:** Added `aria-label="Sign in to your account"`

## A-06: ✓ Announcements — Label for select dropdown
- **File:** `src/app/announcements/page.tsx:17-25`
- **Issue:** `<select>` has no `<label>` element
- **Fix:** Added `aria-label="Filter by region"`

## A-07: ✓ Market — aria-selected on tab buttons
- **File:** `src/app/market/page.tsx:17-21`
- **Issue:** Active tab has only visual styling, no `aria-selected`
- **Fix:** Added `role="tablist"`, `role="tab"`, `aria-selected`

## A-08: Market — Commodity card keyboard support
- **File:** `src/app/market/page.tsx:34-120`
- **Issue:** Interactive `<div>` cards have no `role`, `tabindex`, or keyboard handlers
- **Fix:** Either make them `<button>` elements or add `role="button" tabIndex={0}` with `onKeyDown`

## A-09: Announcements — Card keyboard support
- **File:** `src/app/announcements/page.tsx:44-135`
- **Issue:** Same as A-08 for announcement cards
- **Fix:** Same as A-08

## A-10: Profile — Toggle switch accessibility
- **File:** `src/app/profile/page.tsx:128-130`
- **Issue:** The toggle `<input>` and its visual `<div>` are siblings, not properly associated
- **Fix:** Restructure to use `<label>` wrapping both input and visual indicator

## A-11: ✓ ArticleCard — Bookmark button aria-label
- **File:** `src/components/ArticleCard.tsx:67-82`
- **Issue:** Has `title` but no `aria-label`
- **Fix:** Added `aria-label` to both ArticleCard and FeaturedArticleCard bookmark buttons

## A-12: Color contrast verification
- **File:** Throughout — especially `text-gray-400` on white backgrounds
- **Issue:** Color contrast not verified against WCAG AA (4.5:1)
- **Fix:** Audit all text colors, replace gray-400 with darker variants where needed

## A-13: ✓ Skip-to-content link
- **File:** `src/app/layout.tsx`
- **Issue:** No skip navigation link for keyboard users
- **Fix:** Added sr-only "Skip to content" link + `id="main-content"` on `<main>`

## A-14: Form input labels
- **File:** `src/app/login/page.tsx:66-75, 82-91`
- **Issue:** Labels use `htmlFor` (react `className`) incorrectly — should be `htmlFor`
- **Fix:** Use React's `htmlFor` prop correctly on `<label>` elements

## A-15: ✓ Verify — Button inside Link (not an issue)
- **File:** `src/components/ArticleCard.tsx:28-81`
- **Issue:** `<Link>` wrapping a `<button>` (bookmark). Invalid HTML.
- **Fix:** Verified — button and Link are siblings, not nested. Valid HTML. Refactored to use useBookmark hook.

## A-16: ✓ Verify — Same as A-15 (not an issue)
- **File:** `src/components/FeaturedArticleCard.tsx:28-83`
- **Issue:** Same invalid HTML as A-15
- **Fix:** Same as A-15
