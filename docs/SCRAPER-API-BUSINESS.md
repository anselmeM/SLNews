# SLNews Scraper API — Business Roadmap

> Goal: turn the Sierra Leone news scraper (currently a Render service serving the SLNews app) into a **sellable data API product**. The SLNews app becomes "customer #1" — it consumes the same public contract any paying customer will use.

---

## 1. Current architecture (today)

```
[SL sources: Sierra Leone Telegraph, Politico SL, Concord Times]
        ↓  cron scrapes
[Scraper service on Render — slnewsapiscapper.onrender.com]
        │  own DB (staging copy)
        ↓  GET /api/news  (Bearer API key, raw JSON array)
[SLNews app on Vercel]
        │  sync-scraper.ts → Neon DB (final storage)
        ↓
[SLNews feeds / National News / home]
```

- **Two production databases is intentional**: the scraper's DB is the future product's data store; Neon is the app's. Do NOT consolidate them.
- The app already talks to the scraper through a **typed client** (`src/lib/scraper-client.ts`) that:
  - calls `GET /v1/news` first,
  - falls back to the legacy `GET /api/news` on 404,
  - accepts both a raw array and a `{ data: [...] }` envelope,
  - sends `Authorization: Bearer <key>`.
- Article shape (what the client/types expect): `{ id, title, link, author, description, category[], imageUrl, paragraphs[], pubDate, source, createdAt }`.

---

## 2. The future API contract (v1) — what the app already expects

```
GET /v1/news
Authorization: Bearer <api-key>

Query params (proposed):
  category    string[]   filter by category (e.g. politics, economy, sports)
  source      string     filter by source name
  from / to   ISO date   published-date window
  page        int        default 1
  page_size   int        default 20, max 100

Response:
{
  "data": [ ...ScraperArticle ],
  "meta": { "page": 1, "page_size": 20, "total": 512, "has_more": true }
}

Errors:
  401  invalid/missing key
  403  key without access to this endpoint
  404  endpoint not found (the app falls back to /api/news on this)
  429  rate limit exceeded (include Retry-After header)
  500  server error
```

---

## 3. Roadmap — do in this order

### Phase 1 — Ship `/v1/news` on Render (foundation)
- [ ] Implement `GET /v1/news` matching the contract above (same scraper, new route).
- [ ] Return the `{ data, meta }` envelope with pagination.
- [ ] Keep `/api/news` working as the fallback during transition.
- [ ] Basic OpenAPI/Swagger doc (`/v1/docs`) so the contract is inspectable.
- [ ] Verify the app auto-upgrades: once `/v1/news` returns 200, `src/lib/scraper-client.ts` stops hitting `/api/news` with **zero app changes** (the fallback is already built).

### Phase 2 — Tenant keys & quotas (multi-customer)
- [ ] Replace the single `SCRAPER_API_KEY` with a **keys table** in the scraper DB: `id, name, api_key_hash, customer_id, status, created_at, expires_at`.
- [ ] Store only a hash of the key (never plaintext).
- [ ] Per-key **rate limits** (e.g. requests/min) and **quotas** (e.g. requests/month) enforced in the API layer.
- [ ] Scoped access: later, per-key category/source allow-lists for premium tiers.
- [ ] App migration: keep the app working with its existing key; plan to rotate to a tenant key.

### Phase 3 — Billing & packaging (when ready to sell)
- [ ] Choose provider: **Stripe** (metered billing + API keys) or **Justpaid/RapidAPI** (marketplace) — decide based on distribution strategy.
- [ ] Plans: e.g. Free (limited calls/day, sample data), Pro (full data, higher quota), Enterprise (unlimited, dedicated key, SLA).
- [ ] Usage dashboard per customer (calls, quota consumed).
- [ ] Webhook/email on quota exhaustion or payment failure.

### Phase 4 — Hardening & legal (before real customers)
- [ ] **Licensing check — do this early**: verify you may resell content scraped from Sierra Leone Telegraph / Politico SL / Concord Times. Options: license agreements, linking-back attribution, or selling the *feed structure/API* while keeping full-text rights restricted. This is a real blocker if unaddressed.
- [ ] Caching layer (Redis or in-memory) so repeated requests don't re-scrape.
- [ ] Observability: request logs, error tracking, uptime alerts.
- [ ] Uptime target & a status page.
- [ ] Abuse protection (per-key throttling already in Phase 2; add IP-level limits).

---

## 4. Key decisions to make (owner's call)

| Decision | Options | Notes |
|---|---|---|
| Pricing | per-call, per-month, per-tier | Metered billing suits data APIs |
| Where to sell | direct (Stripe) vs marketplace (RapidAPI) | Marketplace = faster discovery, higher fees |
| Content rights | full-text resale vs link+summary | Legal dependency — resolve first |
| SLA/uptime | none vs paid tier | Don't promise SLA on free tier |
| Docs | OpenAPI + quickstart + changelog | Developer experience sells data APIs |

---

## 5. Reference points in this repo

- `src/lib/scraper-client.ts` — the app's typed client; the de-facto v1 contract definition (with tests in `src/lib/__tests__/scraper-client.test.ts`).
- `src/app/actions/sync-scraper.ts` — ingestion logic; will need its own key rotation when Phase 2 lands.
- `docs/PRODUCTION.md` — production config the API will mirror (secrets, rate limiting patterns).
