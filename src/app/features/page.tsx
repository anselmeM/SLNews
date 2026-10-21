import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Features — SLNews",
  description:
    "Reader, Read original, daily briefing, live weather, sports tables, offline reading and following controls in the SLNews app.",
  alternates: { canonical: siteUrl("/features") },
};

const sections = [
  [
    "Reader",
    "A clean reading view with the publisher's wordmark, byline, publication time, reading time and a persistent text-size control.",
  ],
  [
    "Read original",
    "Open the publisher's own page inside the app when you want the full experience, then return to the SLNews view with one tap.",
  ],
  [
    "Daily briefing",
    "Three headlines that matter, in a card that adapts to morning, afternoon or evening.",
  ],
  [
    "Live weather",
    "Current conditions for the city you follow, with a graceful fallback when the network is unavailable.",
  ],
  [
    "Sports",
    "Scores, fixtures, league tables, team pages and the teams and leagues you follow.",
  ],
  [
    "Offline",
    "Saved stories are kept on the device and stay readable with no connection.",
  ],
  [
    "Following",
    "A two-column topic mosaic on the feed and full source/topic catalogues behind Manage news sources and Manage news topics.",
  ],
  [
    "Account",
    "Optional sign-in to sync saved stories, likes and follows — with an in-app delete-account flow and a public deletion page.",
  ],
  [
    "Privacy",
    "No analytics SDK, no advertising SDK, no location, contacts, camera or microphone access.",
  ],
];

export default function FeaturesPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
          What&apos;s inside the app
        </h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">
          Built for Sierra Leonean readers: fast on weak connections, readable
          offline, and clear about where every story came from.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(([title, copy]) => (
            <section
              key={title}
              className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5"
            >
              <h2 className="text-lg font-bold text-on-surface">{title}</h2>
              <p className="mt-2 text-sm text-on-surface-variant">{copy}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
