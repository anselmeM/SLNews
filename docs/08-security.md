# 08 — Security (9 tasks)

Fix security vulnerabilities and harden the application.

## S-01: ✓ Cron job missing Authorization header
- **File:** `vercel.json` (cron configuration)
- **Issue:** The cron job that hits `/api/cron/sync` does NOT include an `Authorization` header in its definition. The route checks `request.headers.get("authorization") === Bearer ${CRON_SECRET}` — so every cron execution will return 401 and fail silently.
- **Fix:** Vervel cron now passes `?secret=${CRON_SECRET}` query param; route accepts both query param and Authorization header

## S-02: No CSRF protection on forms
- **File:** `src/app/login/page.tsx`, `src/app/actions/article-actions.ts`
- **Issue:** Login form and article upsert have no CSRF tokens
- **Fix:** NextAuth v5 provides built-in CSRF via `signIn("credentials", { csrfToken })` or use built-in Next.js CSRF if available

## S-03: ✓ No input sanitization on search
- **File:** `src/app/search/page.tsx` + `src/lib/news-service.ts:140-149`
- **Issue:** Raw user input passed to `searchArticles(query)` with no length limit
- **Fix:** Added `query.trim().slice(0, 200)` and empty string rejection
- **File:** `src/app/search/page.tsx` + `src/lib/news-service.ts:140-149`
- **Issue:** Raw user input passed to `searchArticles(query)` with no length limit
- **Fix:** Add `query.trim().slice(0, 200)` and reject empty strings

## S-04: No search rate limiting
- **File:** `src/lib/news-service.ts:140-149`
- **Issue:** Search endpoint has no rate limiting — vulnerable to abuse
- **Fix:** Add server-side rate limiting (e.g., limit to 30 searches per minute per IP)

## S-05: API keys in sync function URLs
- **File:** `src/app/actions/sync-news-api.ts:44-62`
- **Issue:** `MEDIASTACK_API_KEY` embedded in string template URLs. If the file is accidentally imported client-side, the key would leak.
- **Fix:** Read the key separately and construct URLs with a helper function

## S-06: No rate limiting on auth endpoint
- **File:** `src/app/api/auth/[...nextauth]/route.ts`
- **Issue:** Login endpoint has no brute-force protection
- **Fix:** Add server-side rate limiting (e.g., 5 attempts per minute per IP)

## S-07: Article content rendered without sanitization
- **File:** `src/app/article/[id]/page.tsx:94`
- **Issue:** `article.content` rendered via `whitespace-pre-wrap` — safe now (text only), but if rich HTML is ever supported, it needs sanitization
- **Fix:** For now this is safe; add a note that if HTML content is ever stored, use DOMPurify

## S-08: Potentially public pages behind auth
- **File:** `proxy.ts:15-16`
- **Issue:** `/about`, `/market`, `/announcements` require login. These seem like they could be public informational pages.
- **Fix:** Add them to `publicRoutes` in middleware if desired

## S-09: Theme script uses dangerouslySetInnerHTML
- **File:** `src/app/layout.tsx:23-40`
- **Issue:** Inline `<script>` with `dangerouslySetInnerHTML` — no XSS risk here (only sets class names) but is a security marker
- **Fix:** Document that this is intentional and safe (reads from localStorage only)
