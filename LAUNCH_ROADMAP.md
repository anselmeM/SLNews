# SLNews: January Launch Roadmap (4-Month Strategic Plan)

A phased, month-by-month execution plan to prepare, package, test, and publicly launch **SLNews** in Sierra Leone in **January 2027**, supported by Google Play distribution and Facebook Ads.

> **Status (reconciled 2026-09-15):** Milestone 1 is reconciled against the code shipped on `master` (PR #54). Checked items are implemented and verified; the four unchecked items (ArticleRead, feed-card WhatsApp share, news-route SWR, health warm-up ping) remain open work.

---

## Executive Summary & Market Strategy

* **Launch Target:** January 2027
* **Primary Target Geo:** Sierra Leone (Freetown / Western Area, Bo, Kenema, Makeni)
* **Secondary Target Geo:** Diaspora (Canada, United Kingdom, United States)
* **Distribution Model:** Android Trusted Web Activity (TWA) via Google Play Store + Web Progressive Web App (PWA)
* **Primary User Acquisition Channel:** Meta Ads (Facebook App Install & Traffic campaigns) + WhatsApp viral sharing
* **Key Strategic Advantage:** Canadian banking enables frictionless Meta Ads billing and Google Play Console access without West African currency/card limits.

---

## High-Level Milestone Calendar

| Month | Milestone | Primary Objective |
| :--- | :--- | :--- |
| **October 2026** | **Milestone 1: Technical Hardening & Tracking** | Meta Pixel integration, 1-tap WhatsApp sharing, offline fallback shell, and Neon DB cold-start elimination. |
| **November 2026** | **Milestone 2: Android Packaging & Closed Beta** | Package app with Bubblewrap TWA, configure Google Play Console, and complete the mandatory 20-tester / 14-day closed beta. |
| **December 2026** | **Milestone 3: Marketing & Freetown Pilot** | Meta Business Suite setup, ad creative production, and live beta testing during the "December in Freetown" holiday rush. |
| **January 2027** | **Milestone 4: Public Launch & Growth Scale** | Google Play public rollout, scaled Facebook App Install campaigns, diaspora campaign, and retention optimization. |

---

## Detailed Monthly Milestones

### Milestone 1: October 2026 — Technical Hardening & Tracking Foundation

**Focus:** Prepare the codebase for high-volume, low-bandwidth mobile traffic and accurate ad tracking.

#### 1. Meta (Facebook) Tracking Infrastructure
- [x] Add Meta Pixel component in `src/app/layout.tsx` gated by `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`.
- [ ] Implement tracking for essential funnel events:
  - [x] `PageView`: Tracks every screen navigation.
  - [x] `ViewContent`: Fired when a full article is opened.
  - `ArticleRead`: Fired after a user scrolls past 60% or reads for >30 seconds.
  - [x] `InstallPromptClicked`: Fired when the PWA install button or modal is triggered (shipped as the custom event `AppInstallPrompt` in `src/hooks/usePWAInstall.ts`).
  - [x] `ShareWhatsApp`: Fired when an article is shared to WhatsApp (shipped as the standard `Share` event with `method: "whatsapp"` in `src/components/ArticleActions.tsx`).

#### 2. WhatsApp 1-Tap Virality Engine
- [ ] Add an explicit green WhatsApp sharing button in `src/components/ArticleActions.tsx` and article feed items.
- [x] Pre-format share messages to maximize click-throughs in WhatsApp chats:
  `👉 [Headline] - Read the full story on SLNews: https://[domain]/article/[id]?utm_source=whatsapp`

#### 3. Low-Bandwidth & Offline Resilience
- [x] Create a dedicated `/offline` page displaying cached articles and a friendly network status badge.
- [x] Update `public/sw.js` navigation handling to gracefully serve the `/offline` fallback instead of a browser network error when connection drops.
- [x] Verify image compression (ensure Sharp serves compressed WebP/AVIF images to reduce user data consumption on Africell and Orange SL). *(Sharp is installed and Next.js serves WebP by default; explicit AVIF is not enabled in `next.config.ts`.)*

#### 4. Neon DB Cold-Start Prevention
- [ ] Configure `stale-while-revalidate` caching on top news routes to load instant cached content at the edge.
- [ ] Set up an automated ping service (e.g., BetterStack, UptimeRobot, or GitHub Actions cron) pinging `/api/health` every 5 minutes during West African hours (06:00 – 23:00 GMT) to keep Neon Postgres warm.

#### 5. Upstream Scraper Health
- [x] Verify scheduled syncs with `SLNewsAPIScapper` pinned to `/api/news`.
- [x] Confirm automated error logging and alerting if upstream feeds fail. *(Sentry is wired via `withSentryConfig` and `src/instrumentation.ts`; sync failures are logged and returned as structured errors.)*

---

### Milestone 2: November 2026 — Android TWA Packaging & Google Play Beta

**Focus:** Wrap the web app into a lightweight native Android bundle and satisfy Google Play’s testing gates.

#### 1. Trusted Web Activity (TWA) Packaging
- [ ] Install and initialize Google's **Bubblewrap CLI**:
  ```bash
  npx @bubblewrap/cli init --manifest=https://[your-domain]/manifest.json
  ```
- [ ] Generate Android App Bundle (`.aab`) with app size under 3MB.
- [ ] Host `.well-known/assetlinks.json` in `public/` to verify domain ownership and remove the Chrome URL bar.
- [ ] Test `.apk` on real Android devices (Tecno, Infinix, Samsung Galaxy A-series).

#### 2. Google Play Developer Console Setup
- [ ] Register Google Play Developer account ($25 USD one-time fee via Canadian card).
- [ ] Prepare store listing assets:
  - **App Title:** `SLNews - Sierra Leone News & Live Rates`
  - **Short Description:** `Fast Sierra Leone breaking news, daily USD/Leone rates, fuel prices, and offline reading.`
  - **App Icon:** 512x512 PNG.
  - **Feature Graphic:** 1024x500 PNG.
  - **Screenshots:** Phone screenshots (1080x1920 or 1080x2400) showing news feed, dark mode, market rates, and offline view.
  - **Privacy Policy:** Public URL pointing to `/privacy`.

#### 3. The 14-Day Closed Beta Gate (Mandatory)
- [ ] Recruit 20–25 committed testers:
  - 10–12 Sierra Leonean contacts / diaspora in Canada (Toronto, Calgary, Edmonton, Ottawa).
  - 10–12 local contacts in Sierra Leone (Freetown, Bo, Kenema).
- [ ] Publish the `.aab` to Google Play's **Closed Testing** track.
- [ ] Ensure all 20 testers opt-in and remain active on the test track for at least 14 consecutive days to qualify for Google's production approval.

#### 4. Push Notification Verification
- [ ] Test native Android push notification delivery via Web Push / Firebase Cloud Messaging (FCM).
- [ ] Verify notification click-through routing to the exact article page.

---

### Milestone 3: December 2026 — Marketing Assets & "December in Freetown" Pilot

**Focus:** Build ad creative assets, set up the Meta business ecosystem, and leverage the holiday influx in Sierra Leone for organic feedback.

#### 1. Meta Business Suite & Domain Verification
- [ ] Create and brand the official **SLNews** Facebook Page.
- [ ] Verify domain ownership in Meta Business Manager (`slnews.sl` or production domain).
- [ ] Link Meta Pixel to the ad account and configure Aggregated Event Measurement.

#### 2. Ad Creative Production
Produce three distinct ad angles:
1. **The "Data-Saver" Hook:**
   - *Message:* "Why waste 50MB on heavy apps? SLNews is under 3MB and opens instantly on Orange & Africell."
   - *Format:* Static carousel showing data usage comparisons.
2. **The "Market Utility" Hook:**
   - *Message:* "Get today's official and black-market Dollar/Leone exchange rates, fuel prices, and national headlines in one place."
   - *Format:* Clean infographic of the daily rate widget.
3. **The "Breaking Alert" Video Reel (15s):**
   - *Message:* Short video showing an alert popping up on an Android phone, tapping it, and reading the story offline.

#### 3. "December in Freetown" In-Person Pilot
- [ ] Share the beta app with diaspora visiting Sierra Leone for December holidays and festivals.
- [ ] Gather feedback on performance across various Freetown network zones (Lumley, Goderich, Wilberforce, Central, East End).

#### 4. Ad Calibration & Pixel Warming (Late December)
- [ ] Launch a small \$5/day test ad campaign in Freetown.
- [ ] Verify Pixel event firing in Events Manager.
- [ ] Determine baseline Cost Per Click (CPC) (target: \$0.02 – \$0.05).

---

### Milestone 4: January 2027 — Public Launch & Scaled Growth

**Focus:** Execute the public store release, ramp up paid Facebook ads, and drive user retention.

#### Week 1 (Jan 1 – Jan 7): Google Play Production Release
- [ ] Promote Closed Beta build to **Production** on Google Play Console.
- [ ] Confirm public visibility and search indexing for "SLNews" on the Play Store.
- [ ] Publish official launch announcements across social channels and diaspora groups.

#### Week 2 (Jan 8 – Jan 14): Sierra Leone Facebook Ad Push
- [ ] Launch **Meta App Install Campaigns** targeting:
  - **Geos:** Freetown, Western Area, Bo, Kenema, Makeni.
  - **Placement:** Facebook Mobile Feed and Reels.
  - **OS:** Android 8.0+.
  - **Starting Budget:** \$15 – \$30/day.
- [ ] Track Cost Per Install (CPI) and optimize for the best-performing creative angle.

#### Week 3 (Jan 15 – Jan 21): Diaspora Campaign (Canada, UK, US)
- [ ] Launch a targeted diaspora campaign:
  - **Geos:** Canada, UK, US.
  - **Targeting:** Interests in Sierra Leone, West African news, Leone Stars, Freetown.
  - **Objective:** Web traffic and app installs to stimulate cross-border WhatsApp sharing.

#### Week 4 (Jan 22 – Jan 31): Retention & Unit Economics Review
- [ ] Audit Google Play Console health:
  - Crash rate (< 0.5%).
  - Day-1, Day-7, and Day-30 retention rates.
- [ ] Measure push notification open rates and active reader sessions.
- [ ] Review AdSense / monetization return vs. acquisition cost (CAC) to set ongoing monthly ad spend.
