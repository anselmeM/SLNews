import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site-url";

const PLAY_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() ?? "";
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() ?? "";

export const metadata: Metadata = {
  title: "SLNews — Sierra Leone news in your pocket",
  description:
    "The SLNews app: Sierra Leone news, live weather, daily briefings, sports, markets and the stories you follow — with offline reading and the publisher's own page when you want it.",
  alternates: { canonical: siteUrl("/") },
  openGraph: {
    title: "SLNews — Sierra Leone news in your pocket",
    description:
      "Sierra Leone news, live weather, daily briefings, sports, markets and offline reading in one app.",
    type: "website",
    siteName: "SLNews",
    url: siteUrl("/"),
  },
};

const features = [
  [
    "Reader",
    "Clean, fast reading with bylines, reading time and text-size control.",
  ],
  [
    "Read original",
    "Open the publisher's own page inside the app, then return to the SLNews view.",
  ],
  [
    "Daily briefing",
    "Three headlines that matter, morning, afternoon or evening.",
  ],
  [
    "Live weather",
    "Current conditions for the city you follow, from Open-Meteo.",
  ],
  ["Sports", "Scores, fixtures, league tables and the teams you follow."],
  ["Offline", "Saved stories stay readable with no connection."],
] as const;

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SLNews",
  applicationCategory: "NewsApplication",
  operatingSystem: "Android, iOS",
  description:
    "Sierra Leone news, live weather, daily briefings, sports and offline reading.",
  url: siteUrl("/"),
};

function StoreCtas() {
  const button =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-colors";
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {PLAY_URL ? (
        <a
          href={PLAY_URL}
          className={`${button} bg-black text-white hover:bg-neutral-800`}
        >
          Get it on Google Play
        </a>
      ) : (
        <span
          className={`${button} cursor-default border border-outline-variant/40 text-on-surface-variant`}
        >
          Google Play — coming soon
        </span>
      )}
      {APP_STORE_URL ? (
        <a
          href={APP_STORE_URL}
          className={`${button} bg-black text-white hover:bg-neutral-800`}
        >
          Download on the App Store
        </a>
      ) : (
        <span
          className={`${button} cursor-default border border-outline-variant/40 text-on-surface-variant`}
        >
          iOS — coming soon
        </span>
      )}
    </div>
  );
}

export default function MarketingHome() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }}
      />

      <section className="py-12 sm:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              The SLNews app
            </p>
            <h1 className="text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
              Sierra Leone news, in your pocket.
            </h1>
            <p className="mt-4 text-base text-on-surface-variant sm:text-lg">
              A national feed, live weather, a daily briefing, sports tables and
              the stories you follow — built for weak connections and readable
              offline.
            </p>
            <div className="mt-8">
              <StoreCtas />
            </div>
            <p className="mt-3 text-xs text-on-surface-variant">
              Android 8.0+ · Free · Account optional
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/phone-01-for-you.png"
              alt="For You feed in the SLNews app"
              width={360}
              height={640}
              className="w-full rounded-3xl border border-outline-variant/30 shadow-lg"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/phone-04-article.png"
              alt="Article reader in the SLNews app"
              width={360}
              height={640}
              className="mt-8 w-full rounded-3xl border border-outline-variant/30 shadow-lg"
            />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-t border-outline-variant/20 py-12 sm:py-16"
      >
        <h2 className="text-2xl font-black tracking-tight text-on-surface">
          What&apos;s inside
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Everything a daily SLNews reader asked for.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, copy]) => (
            <div
              key={title}
              className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5"
            >
              <h3 className="text-lg font-bold text-on-surface">{title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-outline-variant/20 py-12 sm:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-on-surface">
              Get the app
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Available on Android now; iOS is on the way. Install the app to
              save stories offline and follow the teams, places and topics that
              matter to you.
            </p>
            <ol className="mt-4 space-y-2 text-sm text-on-surface-variant">
              <li>1. Install SLNews from Google Play.</li>
              <li>2. Pick your city and the topics you follow.</li>
              <li>3. Open the app daily — your briefing is waiting.</li>
            </ol>
            <div className="mt-6">
              <StoreCtas />
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/phone-03-sports.png"
            alt="Sports standings in the SLNews app"
            width={420}
            height={760}
            className="mx-auto w-full max-w-xs rounded-3xl border border-outline-variant/30 shadow-lg"
          />
        </div>
      </section>

      <section
        id="faq"
        className="border-t border-outline-variant/20 py-12 sm:py-16"
      >
        <h2 className="text-2xl font-black tracking-tight text-on-surface">
          Questions
        </h2>
        <div className="mt-6 space-y-4 text-sm">
          {[
            [
              "Is SLNews free?",
              "Yes. Reading, search, saving and following are free; an account is optional and only needed to sync across devices.",
            ],
            [
              "Does it work offline?",
              "Saved stories stay readable offline, and the last feed you loaded is cached on the device.",
            ],
            [
              "How do I delete my account?",
              "In the app: Settings → SLNews account → Delete account, or from the public account deletion page.",
            ],
            [
              "Where does the news come from?",
              "Sierra Leonean and international publishers, each story attributed with a link to the original.",
            ],
            [
              "Do you show ads?",
              "Sponsored cards are labelled Ad and served by SLNews. There is no third-party ad SDK in the app.",
            ],
          ].map(([question, answer]) => (
            <details
              key={question}
              className="rounded-2xl border border-outline-variant/30 p-4"
            >
              <summary className="cursor-pointer font-semibold text-on-surface">
                {question}
              </summary>
              <p className="mt-2 text-on-surface-variant">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-outline-variant/20 py-8 text-xs text-on-surface-variant">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SLNews. Sierra Leone.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-on-surface">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-on-surface">
              Terms of use
            </Link>
            <Link href="/delete-account" className="hover:text-on-surface">
              Delete account
            </Link>
            <Link href="/download" className="hover:text-on-surface">
              Download
            </Link>
            <a
              href="mailto:contact@slnews.sl"
              className="hover:text-on-surface"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
