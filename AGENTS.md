<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — standing instructions for AI agents (senior-dev workflow)

You are operating the **SLNews app** (Next.js on Vercel, Neon Postgres via Prisma).
Follow the senior-dev git/GitHub model: branch + PR, conventional commits, CI gate.

## Golden rules
1. NEVER push to `master` directly — every change lands via a feature branch + PR.
2. Conventional Commits, atomic, subject <= 72 chars, body explains WHY.
3. CI is the gate (`lint`, `test`, `typecheck`, `build`). Local checks before push:
   `npm run test:run`, `npm run typecheck`, `npm run lint` (npm test is vitest WATCH
   mode — use the one-shot script).
4. Never rewrite pushed history; if a force-push is unavoidable use `--force-with-lease`.
5. No secrets in code — env vars live in Vercel settings.

## Business rules (do not violate)
- The app is "customer #1" of the SLNews scraper API (`C:\Users\amotc\Documents\GitHub\SLNewsAPIScapper`).
- The app consumes the LEGACY full-text endpoint `/api/news` — `src/lib/scraper-client.ts`
  is pinned there. NEVER switch it to `/v1/news`: that endpoint is metadata-only for
  future paying customers (no `link`, no `paragraphs` — the sync would silently skip
  every article).
- Keep the two services and their databases separate (app Neon DB vs scraper DB).

## Repo map (verify before relying)
- `src/lib/scraper-client.ts` — typed scraper-API client (pinned to /api/news).
- `src/app/actions/sync-scraper.ts` — ingestion into Neon (category aliases:
  "Local"->"National", "Politics & Law"->"Politics", "Economy & Business"->"Economy").
- `src/app/actions/*` — auth, feed, article, market, push, search actions.
- `src/lib/db.ts` — Prisma client.

## Known CI debt
- `e2e` job is red on master (5 tests: bottom-nav Local News aria-label, /local-news h1
  renders "National News", no article links on /home, Comments heading). Pre-existing;
  fix as a separate workstream — do not bundle into unrelated changes.
