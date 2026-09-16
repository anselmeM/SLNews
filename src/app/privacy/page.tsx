import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | SLNews",
  description: "Privacy policy and data protection practices for the SLNews application.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8 border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          Legal & Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-on-surface-variant">
          Last updated: September 2026 · Effective for SLNews Web and Mobile Apps
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-on-surface-variant leading-relaxed">
        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            1. Overview & Commitment
          </h2>
          <p>
            <strong>SLNews</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. We provide community journalism, news aggregation, and foreign exchange market updates for Sierra Leone and its global diaspora. This Privacy Policy explains how we collect, use, and protect your information when you access our website or mobile application.
          </p>
          <p className="mt-2">
            We adhere to the principle of data minimization: we only collect the minimum information required to deliver fast, reliable, and data-efficient news services.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">database</span>
            2. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Account Information:</strong> If you choose to create an account or submit community notices, we collect your name and email address via our authentication provider (Clerk). Guest reading does not require an account.
            </li>
            <li>
              <strong>Local On-Device Storage:</strong> Articles you bookmark, your reading history, and your theme preferences (Dark/Light mode) are stored directly on your device via browser local storage to enable offline reading.
            </li>
            <li>
              <strong>Push Notification Tokens:</strong> If you voluntarily enable breaking news alerts, we store an encrypted web-push subscription endpoint so our server can dispatch news alerts. You can revoke this anytime in your device settings.
            </li>
            <li>
              <strong>Anonymous Usage Data:</strong> We collect non-personally identifiable diagnostic data (such as page views, device type, and approximate network connection status) to optimize performance on mobile networks.
            </li>
          </ul>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">hub</span>
            3. Third-Party Services
          </h2>
          <p>We work with trusted service providers to support our platform:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong>Clerk:</strong> Secure user authentication and session management.</li>
            <li><strong>Meta (Facebook) Pixel:</strong> Anonymous event attribution for app downloads and audience reach.</li>
            <li><strong>Google AdSense:</strong> Contextual advertising display to fund independent reporting.</li>
            <li><strong>Vercel & Neon Postgres:</strong> Cloud hosting, content delivery, and encrypted database storage.</li>
          </ul>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">security</span>
            4. Data Retention and Your Rights
          </h2>
          <p>
            You have full control over your personal data. You may at any time:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Request a copy of the personal data associated with your account.</li>
            <li>Request permanent deletion of your account and any user-submitted community notices.</li>
            <li>Clear cached offline articles and preferences at any time through your browser or app settings.</li>
          </ul>
          <p className="mt-3">
            To submit a data access or deletion request, please email us at{" "}
            <a href="mailto:privacy@slnews.sl" className="text-primary font-semibold hover:underline">
              privacy@slnews.sl
            </a>.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">mail</span>
            5. Contact Us
          </h2>
          <p>
            If you have questions or feedback about this policy, please reach out to our team:
          </p>
          <div className="mt-3 p-3 bg-surface-container rounded-2xl text-xs space-y-1">
            <p><strong>SLNews Privacy & Data Protection Team</strong></p>
            <p>Email: <a href="mailto:privacy@slnews.sl" className="text-primary hover:underline">privacy@slnews.sl</a></p>
            <p>Freetown, Sierra Leone / Toronto, Ontario, Canada</p>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between text-xs">
        <Link href="/" className="text-primary font-bold hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Home
        </Link>
        <Link href="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors">
          Terms of Service →
        </Link>
      </div>
    </div>
  );
}
