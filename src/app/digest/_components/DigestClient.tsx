"use client";

import Link from "next/link";
import { useState } from "react";
import ListenButton from "@/components/ListenButton";
import { useToast } from "@/components/Toast";
import type { PersonalizedDigest } from "@/lib/digest-generator";
import { generateDigestAudioScript } from "@/lib/digest-generator";

export default function DigestClient({ digest }: { digest: PersonalizedDigest }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const audioScript = generateDigestAudioScript(digest);

  const handleShareWhatsApp = () => {
    const text = `📰 *SLNews Morning Briefing* (${digest.dateFormatted})\n\n⭐ *Top Story:* ${digest.leadStory?.title || "Daily News"}\n\n👉 Read your personalized Sierra Leone digest at: https://slnews.org/digest`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast("Digest link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Could not copy link", "error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Briefing Header */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">newspaper</span>
                Daily Briefing
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {digest.totalReadTimeMinutes} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">
              {digest.greeting}
            </h1>
            <p className="text-sm font-medium text-on-surface-variant mt-1">
              {digest.dateFormatted}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <ListenButton title="SLNews Daily Briefing" content={audioScript} />
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
              aria-label="Share digest to WhatsApp"
            >
              <span className="material-symbols-outlined text-base">share</span>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors border border-outline-variant/30 cursor-pointer min-h-[44px]"
              aria-label="Copy digest link"
            >
              <span className="material-symbols-outlined text-base">
                {copied ? "check" : "link"}
              </span>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* User preferences filter badge bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-4 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-on-surface-variant uppercase tracking-wider">
              Tailored for:
            </span>
            {digest.preferredRegion && (
              <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full font-bold">
                📍 {digest.preferredRegion}
              </span>
            )}
            {digest.preferredTopics.length > 0 ? (
              digest.preferredTopics.map((topic) => (
                <span
                  key={topic}
                  className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full font-medium"
                >
                  #{topic}
                </span>
              ))
            ) : !digest.preferredRegion ? (
              <span className="text-on-surface-variant font-medium">All National Stories</span>
            ) : null}
          </div>
          <Link
            href="/profile"
            className="text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            Customize
          </Link>
        </div>
      </div>

      {/* 1. Lead Story */}
      {digest.leadStory && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">star</span>
            <h2 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">
              Lead Story
            </h2>
          </div>

          <Link
            href={`/article/${digest.leadStory.id}`}
            className="group block bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm hover:border-primary/40 transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              {digest.leadStory.imageUrl && (
                <div className="md:col-span-5 aspect-video md:aspect-auto bg-surface-container overflow-hidden">
                  <img
                    src={digest.leadStory.imageUrl}
                    alt={digest.leadStory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div
                className={`p-6 md:p-8 flex flex-col justify-between ${
                  digest.leadStory.imageUrl ? "md:col-span-7" : "md:col-span-12"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {digest.leadStory.category}
                    </span>
                    {digest.leadStory.location && (
                      <span className="text-xs text-on-surface-variant font-semibold">
                        📍 {digest.leadStory.location}
                      </span>
                    )}
                    <span className="text-xs text-on-surface-variant ml-auto">
                      {digest.leadStory.readTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-on-surface group-hover:text-primary transition-colors tracking-tight leading-snug">
                    {digest.leadStory.title}
                  </h3>
                  <p className="text-base font-normal text-on-surface-variant mt-3 line-clamp-3 leading-relaxed">
                    {digest.leadStory.summary || digest.leadStory.content.slice(0, 200)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-outline-variant/60 text-xs font-semibold text-on-surface-variant">
                  <span>{digest.leadStory.source}</span>
                  <span className="text-primary font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read Story <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 2. Regional Spotlight (if user has region) */}
      {digest.regionalStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              <h2 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">
                From {digest.preferredRegion}
              </h2>
            </div>
            <Link
              href="/local-news"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              More regional <span className="material-symbols-outlined text-xs">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {digest.regionalStories.map((art) => (
              <Link
                key={art.id}
                href={`/article/${art.id}`}
                className="group flex flex-col justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                    <span className="font-bold text-primary">{art.category}</span>
                    <span>{art.readTimeMinutes} min read</span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                    {art.summary || art.content.slice(0, 100)}
                  </p>
                </div>
                <div className="text-[11px] text-on-surface-variant font-medium pt-3 mt-3 border-t border-outline-variant/40">
                  {art.source}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Followed Topics & Key Stories */}
      {digest.topicStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">interests</span>
              <h2 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">
                {digest.preferredTopics.length > 0 ? "Topics You Follow" : "Key National Stories"}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {digest.topicStories.map((art) => (
              <Link
                key={art.id}
                href={`/article/${art.id}`}
                className="group flex gap-4 bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm hover:border-primary/40 transition-all"
              >
                {art.imageUrl && (
                  <div className="w-24 h-24 rounded-xl bg-surface-container overflow-hidden shrink-0">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <div>
                    <span className="text-[11px] font-bold text-primary uppercase">
                      {art.category}
                    </span>
                    <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug mt-0.5">
                      {art.title}
                    </h3>
                  </div>
                  <div className="text-[11px] text-on-surface-variant font-medium flex items-center justify-between pt-1">
                    <span className="truncate">{art.source}</span>
                    <span className="shrink-0">{art.readTimeMinutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Quick Morning Briefs */}
      {digest.quickBriefs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">bolt</span>
            <h2 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">
              Quick Morning Briefs
            </h2>
          </div>

          <div className="bg-surface-container-low rounded-3xl border border-outline-variant p-5 sm:p-6 space-y-4">
            {digest.quickBriefs.map((brief, idx) => (
              <div
                key={brief.id}
                className={`flex items-start gap-3.5 ${
                  idx !== 0 ? "pt-4 border-t border-outline-variant/50" : ""
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {brief.category}
                    </span>
                  </div>
                  <Link
                    href={`/article/${brief.id}`}
                    className="font-bold text-sm text-on-surface hover:text-primary transition-colors line-clamp-2 block"
                  >
                    {brief.title}
                  </Link>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {brief.brief}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
