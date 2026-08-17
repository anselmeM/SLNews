"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import type { NewsArticle } from "@/lib/news-service";
import { calculateReadingTime } from "@/lib/reading-time";
import { useAudioPlayerStore, type PlaybackRate } from "@/store/useAudioPlayerStore";

const RATES: PlaybackRate[] = [0.75, 1, 1.25, 1.5, 2];

export default function ListenPageClient({
  initialArticles,
}: {
  initialArticles: NewsArticle[];
}) {
  const { toast } = useToast();
  const queue = useAudioPlayerStore((s) => s.queue);
  const currentIndex = useAudioPlayerStore((s) => s.currentIndex);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const playbackRate = useAudioPlayerStore((s) => s.playbackRate);
  const playArticle = useAudioPlayerStore((s) => s.playArticle);
  const playQueue = useAudioPlayerStore((s) => s.playQueue);
  const addToQueue = useAudioPlayerStore((s) => s.addToQueue);
  const removeFromQueue = useAudioPlayerStore((s) => s.removeFromQueue);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);
  const next = useAudioPlayerStore((s) => s.next);
  const prev = useAudioPlayerStore((s) => s.prev);
  const setRate = useAudioPlayerStore((s) => s.setRate);
  const clearQueue = useAudioPlayerStore((s) => s.clearQueue);
  const init = useAudioPlayerStore((s) => s.init);

  const [filterTopic, setFilterTopic] = useState<string>("All");

  useEffect(() => {
    init();
    // If queue is empty, initialize queue with top 5 stories
    if (queue.length === 0 && initialArticles.length > 0) {
      useAudioPlayerStore.setState({
        queue: initialArticles.slice(0, 5),
        currentIndex: 0,
        isPlaying: false,
      });
    }
  }, [init, initialArticles, queue.length]);

  const current = queue[currentIndex] || initialArticles[0];

  const handlePlayAllCurated = (articles: NewsArticle[], name: string) => {
    if (articles.length === 0) return;
    playQueue(articles, 0);
    toast(`Playing ${name} (${articles.length} stories)`, "success");
  };

  const handleAddStory = (article: NewsArticle) => {
    addToQueue(article);
    toast(`Added "${article.title.slice(0, 30)}..." to queue`, "info");
  };

  const topFive = initialArticles.slice(0, 5);
  const nationalStories = initialArticles.filter(
    (a) => a.category === "National" || a.category === "Politics"
  ).slice(0, 5);
  const businessTechStories = initialArticles.filter(
    (a) => a.category === "Economy" || a.category === "Tech" || a.category === "Sports"
  ).slice(0, 5);

  const filteredArticles =
    filterTopic === "All"
      ? initialArticles
      : initialArticles.filter((a) => a.category.toLowerCase() === filterTopic.toLowerCase());

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">headphones</span>
              SLNews Audio Studio
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
              {queue.length} in playlist
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Listen to the News
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">
            Hands-free news streaming. Continuous voice narration for all Sierra Leone stories.
          </p>
        </div>

        {queue.length > 0 && (
          <button
            type="button"
            onClick={clearQueue}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-error hover:bg-error-container hover:text-on-error-container transition-colors border border-error/20 self-start md:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">playlist_remove</span>
            Clear Queue
          </button>
        )}
      </div>

      {/* Main Player & Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Now Playing Hero Deck */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-primary animate-ping" : "bg-gray-400"}`} />
                {isPlaying ? "Now Narrating" : "Paused"}
              </span>
              {current && (
                <span className="text-xs font-semibold text-on-surface-variant">
                  {calculateReadingTime(current.content || current.summary).text}
                </span>
              )}
            </div>

            {current ? (
              <div className="space-y-4">
                {current.imageUrl && (
                  <div className="w-full aspect-video rounded-2xl bg-surface-container overflow-hidden shadow-inner relative">
                    <Image
                      src={current.imageUrl}
                      alt={current.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {current.category}
                    </span>
                    {current.location && (
                      <span className="text-xs font-semibold text-on-surface-variant">
                        📍 {current.location}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/article/${current.id}`}
                    className="text-xl sm:text-2xl font-black text-on-surface hover:text-primary transition-colors tracking-tight line-clamp-2 block"
                  >
                    {current.title}
                  </Link>
                  <p className="text-xs font-medium text-on-surface-variant mt-1">
                    By {current.source}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-4 font-normal">
                  {current.summary || current.content.slice(0, 250) + "..."}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-40">
                  queue_music
                </span>
                <p className="font-semibold text-sm">Select a story to start listening</p>
              </div>
            )}
          </div>

          {/* Interactive Player Controls */}
          {current && (
            <div className="pt-6 mt-6 border-t border-outline-variant space-y-4">
              <div className="flex items-center justify-center gap-4">
                {/* Previous */}
                <button
                  type="button"
                  onClick={prev}
                  disabled={currentIndex <= 0}
                  className="p-3 rounded-full text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Previous story"
                >
                  <span className="material-symbols-outlined text-2xl">skip_previous</span>
                </button>

                {/* Play/Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/95 transition-transform active:scale-95 shadow-lg cursor-pointer"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={next}
                  disabled={currentIndex >= queue.length - 1}
                  className="p-3 rounded-full text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Next story"
                >
                  <span className="material-symbols-outlined text-2xl">skip_next</span>
                </button>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2">
                <span className="font-bold uppercase tracking-wider">Playback Speed:</span>
                <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-0.5">
                  {RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRate(r)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        playbackRate === r
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Playlist Queue */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">playlist_play</span>
              <h2 className="font-bold text-sm uppercase tracking-wider text-on-surface">
                Up Next ({queue.length})
              </h2>
            </div>
          </div>

          <div className="overflow-y-auto space-y-2.5 max-h-[440px] pr-1 flex-1">
            {queue.map((item, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-primary shadow-xs"
                      : "bg-surface-container-low border-transparent hover:border-outline-variant text-on-surface"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => playArticle(item)}
                    className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer"
                    aria-label={`Play ${item.title}`}
                  >
                    {isSelected && isPlaying ? (
                      <span className="material-symbols-outlined text-base animate-pulse">
                        volume_up
                      </span>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </button>

                  <div
                    onClick={() => playArticle(item)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-80">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{calculateReadingTime(item.content || item.summary).text}</span>
                    </div>
                    <p className="text-xs font-bold line-clamp-1 mt-0.5">{item.title}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromQueue(idx)}
                    className="p-1.5 rounded-full text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label={`Remove ${item.title} from queue`}
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              );
            })}

            {queue.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant">
                <p className="text-xs font-medium">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curated Audio Channels */}
      <section className="space-y-4 pt-4 border-t border-outline-variant/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">podcasts</span>
          <h2 className="font-bold text-base sm:text-lg text-on-surface">
            Curated Audio Channels
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top 5 Headlines */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                Daily Flash
              </span>
              <h3 className="font-black text-lg text-on-surface mt-2">Today&apos;s Top 5 Headlines</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                The most important news stories of the day in a 5-minute continuous briefing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePlayAllCurated(topFive, "Top 5 Headlines")}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm cursor-pointer min-h-[40px]"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Play All ({topFive.length})
            </button>
          </div>

          {/* National & Politics */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                Governance
              </span>
              <h3 className="font-black text-lg text-on-surface mt-2">National &amp; Politics</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Policy updates, civic affairs, and parliament proceedings across Sierra Leone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePlayAllCurated(nationalStories, "National & Politics")}
              className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-secondary/90 transition-colors shadow-sm cursor-pointer min-h-[40px]"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Play All ({nationalStories.length})
            </button>
          </div>

          {/* Business & Tech */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="bg-tertiary-container text-on-tertiary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                Economy &amp; Innovation
              </span>
              <h3 className="font-black text-lg text-on-surface mt-2">Business, Tech &amp; Sports</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Market shifts, Leone exchange updates, technology trends, and football results.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePlayAllCurated(businessTechStories, "Business, Tech & Sports")}
              className="w-full py-2.5 rounded-xl bg-tertiary text-on-tertiary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-tertiary/90 transition-colors shadow-sm cursor-pointer min-h-[40px]"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Play All ({businessTechStories.length})
            </button>
          </div>
        </div>
      </section>

      {/* Explore More Stories to Queue */}
      <section className="space-y-4 pt-4 border-t border-outline-variant/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">library_music</span>
            <h2 className="font-bold text-base sm:text-lg text-on-surface">
              Explore &amp; Queue Stories
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {["All", "National", "Politics", "Economy", "Tech", "Sports"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterTopic(t)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterTopic === t
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="group flex flex-col justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                  <span className="font-bold text-primary">{art.category}</span>
                  <span>{calculateReadingTime(art.content || art.summary).text}</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>
              </div>

              <div className="flex gap-2 pt-3 mt-3 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => playArticle(art)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors cursor-pointer min-h-[36px]"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  Play
                </button>
                <button
                  type="button"
                  onClick={() => handleAddStory(art)}
                  className="py-1.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-1 border border-outline-variant/30 transition-colors cursor-pointer min-h-[36px]"
                  title="Add to queue"
                >
                  <span className="material-symbols-outlined text-base">playlist_add</span>
                  + Queue
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
