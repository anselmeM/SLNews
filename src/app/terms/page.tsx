import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | SLNews",
  description: "Terms of service and user guidelines for the SLNews application.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8 border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          Legal & Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-on-surface-variant">
          Last updated: September 2026 · Effective for SLNews Web and Mobile Apps
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-on-surface-variant leading-relaxed">
        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">description</span>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the <strong>SLNews</strong> website, mobile applications, or related services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">newspaper</span>
            2. News Aggregation & Content Attribution
          </h2>
          <p>
            SLNews acts as a news aggregator and community platform. Where stories are aggregated from established Sierra Leonean and international publications, original attribution is prominently displayed alongside direct links to the original publisher.
          </p>
          <p className="mt-2">
            SLNews does not claim ownership of third-party copyrighted content. All trademarks, logos, and publisher brand names belong to their respective owners.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">currency_exchange</span>
            3. Financial & Market Information Disclaimer
          </h2>
          <p>
            Foreign exchange rates (USD, GBP, EUR to Sierra Leone Leone NLe), commodity prices, and fuel prices provided on SLNews are compiled for general informational purposes only. While we endeavor to provide accurate and timely updates, market conditions fluctuate rapidly.
          </p>
          <p className="mt-2 text-amber-700 dark:text-amber-400 font-semibold">
            SLNews does not provide financial or investment advice. Always verify current rates with authorized financial institutions or licensed foreign exchange bureaus prior to executing financial transactions.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">campaign</span>
            4. User-Generated Notices & Community Conduct
          </h2>
          <p>
            Users who post community notices, classifieds, or comments must adhere to standard community guidelines:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>No hate speech, defamatory content, harassment, or incitement of violence.</li>
            <li>No fraudulent advertisements, misleading investment schemes, or impersonation.</li>
            <li>No unlawful content under the laws of Sierra Leone.</li>
          </ul>
          <p className="mt-2">
            SLNews reserves the right to review, edit, or remove any notice that violates these standards.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">mail</span>
            5. Contact Information
          </h2>
          <p>
            For legal inquiries, copyright concerns, or feedback, please contact us at:{" "}
            <a href="mailto:contact@slnews.sl" className="text-primary font-semibold hover:underline">
              contact@slnews.sl
            </a>
          </p>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between text-xs">
        <Link href="/privacy" className="text-primary font-bold hover:underline flex items-center gap-1">
          ← Privacy Policy
        </Link>
        <Link href="/" className="text-on-surface-variant hover:text-on-surface transition-colors">
          Home →
        </Link>
      </div>
    </div>
  );
}
