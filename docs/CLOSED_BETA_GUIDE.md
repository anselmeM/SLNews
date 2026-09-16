# Google Play 20-Tester Closed Beta Protocol (14-Day Guide)

This guide provides the operational blueprint to satisfy Google Play's mandatory requirement: **20 testers opted-in for at least 14 consecutive days** before production release and Facebook App Install campaigns can begin.

---

## 1. Google Play Policy Overview

For personal Google Play Developer accounts registered after November 2023:
* **The Requirement:** At least 20 testers must be continuously opted-in to your **Closed Testing** track for a minimum of 14 days.
* **The Goal:** Prove that your app is functional, receives active feedback, and has low crash rates before Google approves public distribution.
* **Timeline Target:** Run the closed beta across **November 2026** so production is approved well before the January 2027 launch.

---

## 2. Tester Recruitment Strategy (Target: 25 Testers)

*Always recruit 24–26 testers to maintain a safety buffer above the 20-tester floor in case anyone opts out.*

### Cohort A: Canadian Diaspora (12–14 Testers)
* **Locations:** Toronto, Calgary, Edmonton, Ottawa, Montreal.
* **Profile:** Sierra Leoneans and West African friends with Android devices.
* **Value:** High device variety (Samsung, Google Pixel, Motorola) and fast, reliable communication.

### Cohort B: Sierra Leone Local Readers (12–14 Testers)
* **Locations:** Freetown (Lumley, Wilberforce, East End), Bo, Kenema, Makeni.
* **Profile:** Daily mobile news readers using local telcos (Orange SL, Africell).
* **Value:** Real-world testing on local 3G/4G network latencies and lower-end Android hardware (Tecno, Infinix, Itel).

---

## 3. WhatsApp Recruitment Message Template

Copy and send this message to potential beta testers:

```text
🇸🇱 Hello! I am preparing to launch SLNews (a fast, data-saving news & currency rate app for Sierra Leone).

Before releasing on Google Play, Google requires 20 beta testers to test the app for 14 days.

Could you help me test it on your Android phone?
1. Open this link: https://play.google.com/apps/testing/com.slnews.app
2. Tap "Become a Tester" and install the app.
3. Keep the app on your phone for 2 weeks and browse the news whenever you have time.

Your feedback will help us build the best news experience for Sierra Leone! Thank you so much for your support! 🙏
```

---

## 4. Google Play Console Setup Steps

1. **Upload the App Bundle:**
   * Go to **Google Play Console** $\rightarrow$ select **SLNews**.
   * Navigate to **Testing** $\rightarrow$ **Closed testing**.
   * Create a new track (e.g., `Closed Beta`).
   * Upload `app-release-bundle.aab`.

2. **Set Up Tester Email List:**
   * In the Closed track, click the **Testers** tab.
   * Click **Create email list** (name it `SLNews Beta Testers`).
   * Add the Google Account (@gmail.com) email addresses of your 25 testers.
   * Save changes.

3. **Distribute the Opt-In Link:**
   * Under **How testers join your test**, copy the **Join on Android** or **Join on the web** link:
     `https://play.google.com/apps/testing/com.slnews.app`
   * Share this link with your testers.

---

## 5. 14-Day Tracking Protocol

| Day | Action Item | Status |
| :--- | :--- | :--- |
| **Day 0** | Invite 25 testers; verify all 20+ have accepted the opt-in link. | [ ] |
| **Day 1–3** | Confirm all testers successfully installed the app; check Google Play Console "Active Testers" counter. | [ ] |
| **Day 4–7** | Dispatch 2 breaking news push notifications to test delivery and engagement. | [ ] |
| **Day 8–10** | Collect feedback on reading speed, offline mode, and currency exchange rates. | [ ] |
| **Day 11–13** | Verify that the active tester count has remained $\ge 20$ continuously. | [ ] |
| **Day 14** | Complete the Google Play production questionnaire and submit for **Production Access Review**. | [ ] |

---

## 6. Common Pitfalls to Avoid

1. **Tester Drop-off:** If your tester count dips below 20 for even one day, the 14-day clock may reset. Keep 25 active testers.
2. **Missing Privacy Policy:** Ensure `https://[domain]/privacy` is linked in the Store Presence settings before submitting for review.
3. **No App Engagement:** Ask testers to open the app at least 2–3 times a week so Google's automated telemetry logs genuine user engagement.
