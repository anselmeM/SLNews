import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | SLNews",
  description:
    "Terms of service for the SLNews Android and iOS apps and the SLNews website: accounts, acceptable use, content attribution and the market-data disclaimer.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8 border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          Legal &amp; Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-on-surface-variant">
          Last updated: October 2026 · Covers the SLNews Android and iOS apps
          and this website
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-on-surface-variant leading-relaxed">
        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              description
            </span>
            1. Acceptance of terms
          </h2>
          <p>
            By installing or using the <strong>SLNews</strong> mobile
            applications, this website, or related services, you agree to these
            Terms of Service. If you do not agree, please do not use the
            service.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              newspaper
            </span>
            2. What SLNews is — and is not
          </h2>
          <p>
            SLNews is a news <strong>aggregator</strong>. We collect headlines,
            summaries, images and links from Sierra Leonean and international
            publications and present them in one feed. We do not publish that
            reporting, and presenting a story is not an endorsement of it.
          </p>
          <p className="mt-2">
            Each story carries the publisher&apos;s name and, where available, a
            link to the original article. Always read the original for the full
            report.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              account_circle
            </span>
            3. Accounts
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              An account is optional. Reading, searching, saving and liking work
              on your device without one.
            </li>
            <li>
              Signing in syncs your saved stories, likes and follows across
              devices.
            </li>
            <li>
              Keep your sign-in credentials secure; you are responsible for
              activity under your account.
            </li>
            <li>
              You may delete your account at any time in the app or on the{" "}
              <Link
                href="/delete-account"
                className="text-primary font-semibold hover:underline"
              >
                account deletion page
              </Link>
              . Deletion cannot be undone.
            </li>
            <li>
              We may suspend or remove accounts that abuse the service or break
              these terms.
            </li>
          </ul>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              rule
            </span>
            4. Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>
              copy, scrape, republish or redistribute SLNews or publishers&apos;
              content for commercial purposes, or attempt to bypass access
              limits;
            </li>
            <li>
              reverse-engineer, decompile or interfere with the apps or their
              servers, or probe them for vulnerabilities without written
              permission;
            </li>
            <li>
              use the service to break the law, infringe rights, spread malware,
              or impersonate another person or organisation;
            </li>
            <li>
              misrepresent an affiliation with SLNews or with any publisher.
            </li>
          </ul>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              copyright
            </span>
            5. Content attribution and intellectual property
          </h2>
          <p>
            SLNews does not claim ownership of third-party copyrighted content.
            All trademarks, logos and publisher brand names belong to their
            respective owners and are used to identify the source of a story.
            The SLNews name, mark, app design and software are ours or our
            licensors&apos;.
          </p>
          <p className="mt-2">
            If you are a rights holder and believe something is used
            incorrectly, contact{" "}
            <a
              href="mailto:contact@slnews.sl"
              className="text-primary font-semibold hover:underline"
            >
              contact@slnews.sl
            </a>{" "}
            and we will review it promptly.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              currency_exchange
            </span>
            6. Financial and market information
          </h2>
          <p>
            Exchange rates (USD, GBP, EUR to the Sierra Leone Leone), commodity
            and fuel prices, and the market index quotes in the Stocks section
            are compiled for general information only. Data comes from
            third-party feeds, may be delayed, incomplete or unavailable, and
            can change rapidly.
          </p>
          <p className="mt-2 text-amber-700 dark:text-amber-400 font-semibold">
            SLNews does not provide financial, investment, legal or tax advice
            and is not a broker, exchange or adviser. Always verify rates with
            authorised institutions before any transaction, and do not rely on
            this data for trading decisions.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              campaign
            </span>
            7. Community features on the website
          </h2>
          <p>
            Community notices and announcements on the website must not contain
            hate speech, defamation, harassment or incitement; fraudulent
            offers, misleading investment schemes or impersonation; or content
            that is unlawful under the laws of Sierra Leone. We may review, edit
            or remove any notice that violates these standards.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              cloud
            </span>
            8. Availability and changes
          </h2>
          <p>
            We may add, change or remove features, content sources and sections
            at any time. The service depends on third-party feeds and providers
            we do not control, so availability and accuracy are not guaranteed.
            Updates may be required to keep using the apps.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              extension
            </span>
            9. Third-party services
          </h2>
          <p>
            The apps and website link to publishers, play video through an
            embedded YouTube player, can open Google Translate on request, and
            show market data from third-party feeds. Those services have their
            own terms and privacy policies, which apply when you use them.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              gpp_maybe
            </span>
            10. Disclaimers and limitation of liability
          </h2>
          <p>
            The service is provided{" "}
            <strong>&quot;as is&quot; and &quot;as available&quot;</strong>,
            without warranties of any kind, express or implied, including
            accuracy, fitness for a particular purpose and non-infringement.
            Nothing here excludes rights you have under mandatory law.
          </p>
          <p className="mt-2">
            To the maximum extent permitted by law, SLNews is not liable for
            indirect, incidental, special or consequential loss, or for lost
            profits, data or goodwill. We are not liable for the content of
            third-party publishers or services.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              logout
            </span>
            11. Termination
          </h2>
          <p>
            You may stop using the service at any time and delete your account.
            We may suspend or end access for breach of these terms or where
            required by law.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              balance
            </span>
            12. Governing law
          </h2>
          <p>
            These terms are governed by the laws of{" "}
            <strong>Sierra Leone</strong>, and disputes are subject to the
            courts of Freetown, unless mandatory consumer law in your country of
            residence gives you a different forum.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              mail
            </span>
            13. Contact information
          </h2>
          <p>
            For legal inquiries, copyright concerns or feedback, contact us at{" "}
            <a
              href="mailto:contact@slnews.sl"
              className="text-primary font-semibold hover:underline"
            >
              contact@slnews.sl
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link
          href="/privacy"
          className="text-primary font-bold hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Privacy Policy
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/delete-account"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Delete your account
          </Link>
          <Link
            href="/"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
