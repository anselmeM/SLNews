# 01 — Hardcoded Content (19 tasks)

Replace static content with data-driven sources.

## H-01: Weather display
- **File:** `src/app/home/page.tsx:40`
- **Issue:** `"Freetown 27°"` hardcoded
- **Fix:** Fetch from weather API or remove

## H-02: Time-of-day greeting
- **File:** `src/app/home/page.tsx:42`
- **Issue:** `"Good Morning"` static
- **Fix:** Use `new Date().getHours()` to select greeting

## H-03: Market — Rice card
- **File:** `src/app/market/page.tsx:35-54`
- **Issue:** Hardcoded price "Le 850", trend "+2.5%", label "Imported - Uncle Sam"
- **Fix:** Create MarketPrice model in Prisma, fetch from DB

## H-04: Market — Petrol card
- **File:** `src/app/market/page.tsx:57-76`
- **Issue:** Hardcoded price "Le 30", "Stable" status
- **Fix:** Same as H-03

## H-05: Market — Palm Oil card
- **File:** `src/app/market/page.tsx:79-98`
- **Issue:** Hardcoded price "Le 220", trend "-1.2%"
- **Fix:** Same as H-03

## H-06: Market — Cement card
- **File:** `src/app/market/page.tsx:101-120`
- **Issue:** Hardcoded price "Le 185", trend "+5.0%"
- **Fix:** Same as H-03

## H-07: Market — Last updated timestamp
- **File:** `src/app/market/page.tsx:24`
- **Issue:** `"Last updated: Today, 08:30 AM"` hardcoded
- **Fix:** Pull from most recent market data entry

## H-08: Market — Regional comparison
- **File:** `src/app/market/page.tsx:124-161`
- **Issue:** Hardcoded prices for 4 provinces
- **Fix:** Same data-driven approach as H-03

## H-09: Announcements — Clean-Up Day card
- **File:** `src/app/announcements/page.tsx:44-73`
- **Issue:** Entirely hardcoded notice, date "Today, 08:00 AM"
- **Fix:** Create Announcement model in Prisma, fetch from DB

## H-10: Announcements — Health Screening card
- **File:** `src/app/announcements/page.tsx:75-104`
- **Issue:** Hardcoded NGO notice, date "Yesterday"
- **Fix:** Same as H-09

## H-11: Announcements — Trade Fair card
- **File:** `src/app/announcements/page.tsx:106-135`
- **Issue:** Hardcoded event, date "Oct 12"
- **Fix:** Same as H-09

## H-12: Profile — Avatar image
- **File:** `src/app/profile/page.tsx:41`
- **Issue:** Hardcoded Unsplash URL
- **Fix:** Use session user image if available, else initials

## H-13: ✓ Login — Pre-filled demo credentials
- **File:** `src/app/login/page.tsx:10-11`
- **Issue:** `useState("author1@slnews.local")` and `useState("password123")`
- **Fix:** Default to empty strings, gate behind `NODE_ENV === "development"`
- **Done:** Changed defaults to `""`, demo box gated behind dev mode

## H-14: ✓ Login — Demo accounts display
- **File:** `src/app/login/page.tsx:108-118`
- **Issue:** Shows credentials in a box visible in production
- **Fix:** Wrap in `process.env.NODE_ENV === "development"` check
- **Done:** Gated behind `NODE_ENV === "development"`

## H-15: Dashboard — Mock reads count
- **File:** `src/app/dashboard/page.tsx:30`
- **Issue:** `"12,450"` with comment "Mock reads for now"
- **Fix:** Track read counts in DB or remove

## H-16: Article — Comments count
- **File:** `src/app/article/[id]/page.tsx:105`
- **Issue:** `"Read Comments (14)"` hardcoded
- **Fix:** Fetch comment count from DB; if no comments system, show "Comment" or remove

## H-17: Article — Related articles
- **File:** `src/app/article/[id]/page.tsx:15`
- **Issue:** Comment: "Using trending as mock related"
- **Fix:** Fetch articles with same category or tags

## H-18: Article — Author avatar
- **File:** `src/app/article/[id]/page.tsx:49`
- **Issue:** Hardcoded Unsplash URL for author photo
- **Fix:** Use author's profile image or initials

## H-19: Article — Tags
- **File:** `src/app/article/[id]/page.tsx:101`
- **Issue:** Static `"News"` tag, only category as dynamic tag
- **Fix:** Add real tags field to Article model or use categories
