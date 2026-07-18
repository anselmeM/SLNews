# 07 — Code Organization (12 tasks)

Decompose large files, eliminate duplication, and improve structure.

## C-01: Decompose DashboardClient (315 lines)
- **File:** `src/app/dashboard/_components/DashboardClient.tsx`
- **Issue:** One file contains: editor form, tab management, draft/published lists, and admin sync UI
- **Fix:** Split into:
  - `EditorForm.tsx` — title, summary, content, image, province/category selects, save buttons
  - `ArticleList.tsx` — shared draft/published list component
  - `AdminSyncPanel.tsx` — sync button + result display
  - `DashboardClient.tsx` — tab state + layout orchestration

## C-02: ✓ Extract shared useBookmark hook
- **File:** `src/components/ArticleCard.tsx:11-19` and `src/components/FeaturedArticleCard.tsx:11-20`
- **Issue:** Both components have identical `isSaved`, `toggleSave`, `dataSaver`, `handleBookmark` logic
- **Fix:** Create `src/hooks/useBookmark.ts`:
  ```ts
  export function useBookmark(article: NewsArticle) {
    const isSaved = useAppStore((s) => s.isSaved(article.id));
    const toggleSave = useAppStore((s) => s.toggleSave);
    const handleBookmark = (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      toggleSave(article);
      toggleSavedArticle(article.id);
    };
    return { isSaved, handleBookmark };
  }
  ```

## C-03: Extract shared BookmarkButton component
- **File:** `src/components/ArticleCard.tsx:69-82` and `src/components/FeaturedArticleCard.tsx:68-83`
- **Issue:** Nearly identical bookmark button markup in both cards
- **Fix:** Create `src/components/BookmarkButton.tsx` using `useBookmark` hook

## C-04: Add barrel exports
- **File:** `src/components/layout/` and `src/lib/`
- **Issue:** No `index.ts` files — imports must use full paths
- **Fix:** Create `src/components/layout/index.ts` and `src/lib/index.ts`

## C-05: Decompose profile page (207 lines)
- **File:** `src/app/profile/page.tsx`
- **Issue:** Mixed concerns: profile card, data saver, regions, notifications, appearance, sign-out
- **Fix:** Split into: `ProfileCard`, `DataSaverSection`, `FollowedRegions`, `NotificationToggles`, `AppearanceSection`

## C-06: Extract mobile drawer from TopAppBar
- **File:** `src/components/layout/TopAppBar.tsx:140-207` (~70 lines)
- **Issue:** Drawer logic is embedded in the 254-line TopAppBar
- **Fix:** Extract to `src/components/layout/MobileDrawer.tsx`

## C-07: Data-drive commodity cards
- **File:** `src/app/market/page.tsx:34-120`
- **Issue:** 4 nearly identical commodity card markup blocks
- **Fix:** Create a single `CommodityCard` component that takes data as props

## C-08: Data-drive announcement cards
- **File:** `src/app/announcements/page.tsx:44-135`
- **Issue:** 3 nearly identical announcement card markup blocks
- **Fix:** Create a single `AnnouncementCard` component that takes data as props

## C-09: Extract shared CategoryTabs component
- **File:** `src/app/home/page.tsx:46-66`, `src/app/national/page.tsx:25-49`, `src/app/world/page.tsx:23-41`
- **Issue:** Three pages have identical horizontal scrollable pill tab navigation
- **Fix:** Create `src/components/CategoryTabs.tsx`

## C-10: Consolidate region/location constants
- **File:** `src/app/page.tsx:8`, `src/app/home/page.tsx:32`, `src/app/local/page.tsx:16`
- **Issue:** Region lists defined in 3 different places with slight variations
- **Fix:** Create `src/lib/constants.ts` with `SL_REGIONS`, `SL_PROVINCES`, etc.

## C-11: Error page consolidation
- **File:** 7 `error.tsx` files (home, dashboard, article, local, national, world, search)
- **Issue:** All identical — fine as-is per Next.js conventions, but worth noting

## C-12: Move dashboard types
- **File:** `src/app/dashboard/_components/DashboardClient.tsx:10-12`
- **Issue:** `DashboardArticle` type defined inline in client component
- **Fix:** Move to `src/lib/types.ts` or a types file
