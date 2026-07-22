# 03 — Mobile Search Gap (3 tasks — ALL COMPLETE ✓)

> Historical audit inventory. Header and drawer search are implemented; the bottom navigation has not been expanded with a search tab. See `TODO.md`.

Fix the missing search affordance on mobile/tablet devices.

## M-01: ✓ Add mobile search icon to TopAppBar
- **File:** `src/components/layout/TopAppBar.tsx`
- **Issue:** Search bar is `hidden md:block`. Below md (mobile), there is no search icon or input visible anywhere in the header.
- **Fix:** Navigates to `/search` page
- **Done:** Search icon button added next to hamburger, visible on `md:hidden`

## M-02: ✓ Add inline search to mobile drawer
- **File:** `src/components/layout/TopAppBar.tsx:196-203`
- **Issue:** Drawer has a "Search News" link but no inline search field
- **Fix:** Added search input form inside the drawer with submit button
- **File:** `src/components/layout/TopAppBar.tsx:196-203`
- **Issue:** Drawer has a "Search News" link that navigates to `/search` but there's no inline search field
- **Fix:** Add a search input inside the drawer so users can search directly without navigating away

## M-03: Add search to BottomNavBar
- **File:** `src/components/layout/BottomNavBar.tsx`
- **Issue:** The bottom nav has Home/Explore/Saved/Profile but no Search tab
- **Fix:** Replace one of the items or add Search as a fifth item
