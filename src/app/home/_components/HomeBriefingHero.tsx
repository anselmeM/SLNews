"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ListenButton from "@/components/ListenButton";
import { useToast } from "@/components/Toast";
import type { PersonalizedDigest, DigestArticle } from "@/lib/digest-generator";
import { generateDigestAudioScript } from "@/lib/digest-generator";
import { vibrateLight, vibrateSuccess } from "@/lib/haptics";
import type { NewsArticle } from "@/lib/news-service";
import { useAudioPlayerStore } from "@/store/useAudioPlayerStore";

function digestArticleToNewsArticle(a: DigestArticle): NewsArticle {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    content: a.content,
    category: a.category,
    imageUrl: a.imageUrl,
    source: a.source,
    publishedAt: a.publishedAt,
    location: a.location,
    authorId: "slnews-system",
  };
}

export default function HomeBriefingHero({ digest }: { digest: PersonalizedDigest }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const audioScript = generateDigestAudioScript(digest);
  const playQueue = useAudioPlayerStore((s) => s.playQueue);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);

  const allDigestArticles: NewsArticle[] = [
    ...(digest.leadStory ? [digestArticleToNewsArticle(digest.leadStory)] : []),
    ...digest.regionalStories.map(digestArticleToNewsArticle),
    ...digest.topicStories.map(digestArticleToNewsArticle),
  ];

  const handlePlayPlaylist = () => {
    if (allDigestArticles.length === 0) return;
    vibrateSuccess();
    playQueue(allDigestArticles, 0);
    toast(`Playing Morning Audio Playlist (${allDigestArticles.length} stories)`, "success");
  };

  const handleShareWhatsApp = () => {
    vibrateLight();
    const text = `📰 *SLNews Morning Briefing* (${digest.dateFormatted})\n\n⭐ *Top Story:* ${digest.leadStory?.title || "Daily News"}\n\n👉 Read your personalized Sierra Leone digest at: https://slnews.org/home`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = async () => {
    vibrateLight();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/home`);
      setCopied(true);
      toast("Briefing link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Could not copy link", "error");
    }
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-5 sm:p-7 shadow-sm mb-8 relative overflow-hidden transition-all">
      {/* Top Bar with Greeting & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">newspaper</span>
              Daily Briefing
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {digest.totalReadTimeMinutes} min read
            </span>
          </div>

          <h1 suppressHydrationWarning className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight">
            {digest.greeting}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-on-surface-variant mt-0.5">
            {digest.dateFormatted}
          </p>
        </div>

        {/* Action Buttons (Audio + Share + Minimize) */}
        <div className="flex items-center gap-2 flex-wrap">
          {allDigestArticles.length > 0 && (
            <button
              type="button"
              onClick={handlePlayPlaylist}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer min-h-[42px]"
              aria-label="Play all briefing articles in audio player"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? "volume_up" : "playlist_play"}
              </span>
              Play Audio ({allDigestArticles.length})
            </button>
          )}

          <ListenButton title="SLNews Daily Briefing" content={audioScript} />

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer min-h-[42px]"
            aria-label="Share briefing to WhatsApp"
            title="Share to WhatsApp"
          >
            <span className="material-symbols-outlined text-base">share</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors border border-outline-variant/30 cursor-pointer min-h-[42px]"
            aria-label="Copy briefing link"
            title="Copy Link"
          >
            <span className="material-symbols-outlined text-base">
              {copied ? "check" : "link"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
            aria-label={collapsed ? "Expand Briefing" : "Collapse Briefing"}
            title={collapsed ? "Expand Briefing" : "Collapse Briefing"}
          >
            <span className="material-symbols-outlined text-xl">
              {collapsed ? "expand_more" : "expand_less"}
            </span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="pt-5 space-y-6 animate-in fade-in duration-200">
          {/* User Preferences Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
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
                <span className="text-on-surface-variant font-medium">All Sierra Leone Stories</span>
              ) : null}
            </div>
            <Link
              href="/profile"
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Personalize
            </Link>
          </div>

          {/* Lead Story Spotlight */}
          {digest.leadStory && (
            <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-outline-variant/30 hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row gap-5">
                {digest.leadStory.imageUrl && (
                  <div className="relative w-full md:w-56 h-40 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                    <Image
                      src={digest.leadStory.imageUrl}
                      alt={digest.leadStory.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 224px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                      Top Headline
                    </span>
                    <span className="text-xs text-on-surface-variant font-semibold">
                      {digest.leadStory.source}
                    </span>
                  </div>

                  <Link href={`/article/${digest.leadStory.id}`} className="block group">
                    <h3 className="text-lg sm:text-xl font-black text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {digest.leadStory.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                    {digest.leadStory.summary || digest.leadStory.content.slice(0, 160)}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <Link
                      href={`/article/${digest.leadStory.id}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Read full story <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {digest.leadStory.readTimeMinutes} min read
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Briefs Bullet Bar (if available) */}
          {digest.quickBriefs.length > 0 && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="material-symbols-outlined text-primary text-base">bolt</span>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Quick Highlights at a Glance
                </h4>
              </div>
              <ul className="space-y-2">
                {digest.quickBriefs.slice(0, 3).map((qb) => (
                  <li key={qb.id} className="text-xs text-on-surface-variant flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-on-surface font-semibold">{qb.title}: </strong>
                      {qb.brief}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
