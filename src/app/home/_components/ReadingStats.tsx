"use client";

import { useAppStore } from "@/store/useAppStore";

/**
 * A visible record of what the reader has built up on this device: stories
 * opened, stories saved, topics followed.
 *
 * This is the deliberately *descriptive* end of accumulation. No streak, no
 * points, no level, and no way to lose progress — missing a day costs nothing.
 * Eyal's Manipulation Matrix asks whether a mechanic serves the reader or
 * extracts from them: a count of what you have read serves the reader, while a
 * streak that breaks is a lever on anxiety, and this loop already has enough of
 * those elsewhere (breaking alerts, the 07:00 briefing).
 *
 * Local-only, like the rest of the store: nothing here leaves the device, and
 * it renders nothing until the first story is opened so a new reader is never
 * greeted with a row of zeros.
 */
export default function ReadingStats() {
  const storiesRead = useAppStore((s) => s.storiesReadCount);
  const savedCount = useAppStore((s) => s.savedArticles.length);
  const topicCount = useAppStore((s) => s.preferredTopics.length);

  if (storiesRead === 0) return null;

  const stats = [
    {
      key: "read",
      icon: "menu_book",
      value: storiesRead,
      label: storiesRead === 1 ? "story read" : "stories read",
    },
    {
      key: "saved",
      icon: "bookmark",
      value: savedCount,
      label: savedCount === 1 ? "story saved" : "stories saved",
    },
    {
      key: "topics",
      icon: "interests",
      value: topicCount,
      label: topicCount === 1 ? "topic followed" : "topics followed",
    },
  ].filter((stat) => stat.value > 0);

  return (
    <section
      aria-label="Your reading on this device"
      className="mb-8 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {stats.map((stat) => (
          <div key={stat.key} className="flex items-center gap-2">
            <span
              aria-hidden
              className="material-symbols-outlined text-[18px] text-primary"
            >
              {stat.icon}
            </span>
            <span className="text-sm text-on-surface">
              <strong className="font-bold tabular-nums">{stat.value}</strong>{" "}
              <span className="text-on-surface-variant">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-on-surface-variant">
        Counted on this device — your reading stays yours.
      </p>
    </section>
  );
}
