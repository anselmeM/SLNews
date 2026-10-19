import type { Metadata } from "next";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "FAQ — SLNews",
  description:
    "Answers about the SLNews app: accounts, offline reading, account deletion, advertising and where the news comes from.",
  alternates: { canonical: siteUrl("/faq") },
};

const faqs = [
  [
    "Is SLNews free?",
    "Yes. Reading, search, saving and following are free. An account is optional and only needed to sync saved stories, likes and follows across devices.",
  ],
  [
    "Which devices are supported?",
    "Android 8.0 and newer today. An iOS version is planned.",
  ],
  [
    "Does it work offline?",
    "Saved stories stay readable offline, and the last feed you loaded is cached on the device. The publisher's own page (Read original) needs a connection.",
  ],
  [
    "How do I delete my account?",
    "In the app: Settings → SLNews account → Delete account. Without the app, use the public account deletion page — Play requires both paths.",
  ],
  [
    "Where does the news come from?",
    "Sierra Leonean and international publishers. Every story carries the publisher's name and, where available, a link to the original.",
  ],
  [
    "Do you show ads?",
    "Sponsored cards are served by SLNews and labelled Ad; there is no third-party advertising SDK in the app.",
  ],
  [
    "Do you track me?",
    "The app has no analytics SDK and does not collect location, contacts, camera or microphone data. Crash diagnostics go to Sentry without an account identifier.",
  ],
  [
    "Who do I contact?",
    "privacy@slnews.sl for privacy and deletion questions; contact@slnews.sl for everything else.",
  ],
];

export default function FaqPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
          Questions and answers
        </h1>
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer]) => (
            <details
              key={question}
              className="rounded-2xl border border-outline-variant/30 p-4"
            >
              <summary className="cursor-pointer font-semibold text-on-surface">
                {question}
              </summary>
              <p className="mt-2 text-sm text-on-surface-variant">{answer}</p>
            </details>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
