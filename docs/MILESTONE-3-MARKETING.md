# Milestone 3 Playbook — December 2026 Marketing & "December in Freetown" Pilot

Operational runbook for the December 2026 milestone: stand up the Meta business
ecosystem, verify tracking, produce the three ad angles, and run the Freetown
pilot ahead of the January 2027 launch.

> **Status:** engineering prep is in place (campaign attribution, `/download`
> landing page, Pixel events). The steps below are the manual/operational work
> that cannot be committed to the repo.

---

## 1. What is already built (engineering prep)

| Piece | Where | What it does |
| :--- | :--- | :--- |
| Campaign attribution | `src/lib/campaign-attribution.ts`, `src/components/CampaignAttributionTracker.tsx` | Captures `utm_*` + `fbclid` on first touch, stores it under `slnews:attribution` (first-touch wins), and fires the `CampaignLanding` event. |
| Ad landing page | `src/app/download/page.tsx` | Conversion page: install CTA, Google Play link, value props, install steps, FAQ, `SoftwareApplication` JSON-LD. |
| Install CTA | `src/app/download/_components/DownloadCTA.tsx` | Fires `AppInstallPrompt` via the PWA prompt and `PlayStoreClick` on the Play link. |

**Default destinations for campaigns:**

- Web / traffic objective → `https://<domain>/download?utm_source=...`
- Android app-install objective → the Google Play listing (`NEXT_PUBLIC_PLAY_STORE_URL`).

Set `NEXT_PUBLIC_PLAY_STORE_URL` in Vercel once the Play listing is live; until
then the `/download` page falls back to `com.slnews.app`.

---

## 2. Meta events we fire

| Event | Type | Fired from | Use in Meta |
| :--- | :--- | :--- | :--- |
| `PageView` | standard | `MetaPixel` | Reach / retargeting |
| `ViewContent` | standard | `TrackArticleView` | Engagement audiences |
| `ArticleRead` | custom | `ArticleReadTracker` (60% scroll or 30s) | Quality-read optimisation |
| `AppInstallPrompt` | custom | `usePWAInstall` | Install-intent audience |
| `Share` (`method=whatsapp`) | standard | `ArticleActions`, `WhatsAppShareButton` | Virality |
| `CampaignLanding` | custom | `CampaignAttributionTracker` | First-touch ad attribution |
| `PlayStoreClick` | custom | `DownloadCTA` | Play-store click intent |

---

## 3. Meta Business Suite & domain setup

- [ ] Create and brand the official **SLNews** Facebook Page (logo, cover, bio, contact).
- [ ] Create **Meta Business Suite** → Business Settings → add the Page and the ad account.
- [ ] Verify the production domain in **Business Settings → Brand Safety → Domains**
      (DNS TXT or HTML file under `public/`). Required for Aggregated Event Measurement.
- [ ] Install the Meta Pixel id and confirm it matches `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` in Vercel.
- [ ] In **Events Manager → Aggregated Event Measurement**, configure and prioritise web events
      (suggested order: `PageView` → `ViewContent` → `ArticleRead` → `AppInstallPrompt` → `Lead`).
- [ ] Attach the Pixel to the ad account and confirm the dataset is receiving events.

## 4. Tracking verification (before spending)

- [ ] **Test Events** in Events Manager: open the site, confirm `PageView`, then open an
      article (`ViewContent`), scroll past 60% (`ArticleRead`), and tap install (`AppInstallPrompt`).
- [ ] Land on `/download?utm_source=facebook&utm_medium=cpc&utm_campaign=dec_freetown_test`
      and confirm `CampaignLanding` fires once; reload and confirm it does **not** fire again
      (first-touch) and that `localStorage["slnews:attribution"]` holds the touch.
- [ ] Run **Meta Pixel Helper** (Chrome extension) on the landing page and an article page.
- [ ] Confirm `fbclid` is present on the stored attribution for a real ad click.

## 5. UTM convention

Lower-case, `snake_case`, no spaces. Every ad URL must carry at least `utm_source`,
`utm_medium`, and `utm_campaign`.

| Param | Convention | Example |
| :--- | :--- | :--- |
| `utm_source` | platform | `facebook`, `instagram` |
| `utm_medium` | channel type | `cpc`, `paid_social`, `whatsapp` |
| `utm_campaign` | objective + month | `dec_freetown_install`, `dec_diaspora_traffic` |
| `utm_content` | creative angle | `data_saver`, `market_utility`, `breaking_alert` |
| `utm_term` | audience/geo (optional) | `freetown`, `diaspora_ca` |

Example: `https://<domain>/download?utm_source=facebook&utm_medium=cpc&utm_campaign=dec_freetown_install&utm_content=data_saver&utm_term=freetown`

## 6. Ad creative briefs (three angles)

1. **The "Data-Saver" Hook** — *"Why waste 50MB on heavy apps? SLNews is under 3MB and
   opens instantly on Orange & Africell."* Format: static carousel comparing data usage.
2. **The "Market Utility" Hook** — *"Today's official and market Dollar/Leone rates, fuel
   prices, and national headlines in one place."* Format: clean infographic of the rate widget.
3. **The "Breaking Alert" Reel (15s)** — short video: an alert pops on a phone, tap, read
   the story offline. Format: vertical video, captions burned in.

## 7. Campaigns & budget

- [ ] Traffic campaign → `/download?utm_...`, targeting Freetown + Western Area, Android, start \$5/day.
- [ ] (After Play approval) App Install campaign → Play listing, Freetown/Bo/Kenema/Makeni, \$15–\$30/day.
- [ ] Diaspora campaign (Canada, UK, US) → `/download?utm_...`, interests in Sierra Leone, Leone Stars, Freetown.

## 8. December pilot logistics

- [ ] Share the beta with diaspora visiting for the holidays.
- [ ] Collect feedback across Freetown network zones (Lumley, Goderich, Wilberforce, Central, East End).
- [ ] Log network/device observations (telco, speed, install friction) per zone.

## 9. Metrics to record weekly

| Metric | Source | Target (from roadmap) |
| :--- | :--- | :--- |
| CPC | Meta Ads Manager | \$0.02 – \$0.05 |
| CPI | Meta Ads Manager | track baseline |
| Landing → install rate | `PlayStoreClick` + `AppInstallPrompt` / sessions | establish baseline |
| `ArticleRead` per session | Events Manager | rising trend |
| Pixel match quality | Events Manager | "Good" or better |

## 10. Roadmap mapping

Milestone 3 items in `LAUNCH_ROADMAP.md` map to this playbook: §3 (Business Suite &
domain verification), §6 (ad creative), §8 (Freetown pilot), §4/§7 (pixel warming &
calibration). Tick the roadmap boxes as each operational step is completed.
