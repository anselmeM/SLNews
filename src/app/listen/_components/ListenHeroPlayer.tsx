"use client";

import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/lib/news-service";
import { calculateReadingTime } from "@/lib/reading-time";
import { useAudioPlayerStore, type PlaybackRate } from "@/store/useAudioPlayerStore";

const RATES: PlaybackRate[] = [0.75, 1, 1.25, 1.5, 2];

interface ListenHeroPlayerProps {
  current?: NewsArticle;
}

export function ListenHeroPlayer({ current }: ListenHeroPlayerProps) {
  const queue = useAudioPlayerStore((s) => s.queue);
  const currentIndex = useAudioPlayerStore((s) => s.currentIndex);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const playbackRate = useAudioPlayerStore((s) => s.playbackRate);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);
  const next = useAudioPlayerStore((s) => s.next);
  const prev = useAudioPlayerStore((s) => s.prev);
  const setRate = useAudioPlayerStore((s) => s.setRate);

  return (
    <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${isPlaying ? "bg-primary animate-ping" : "bg-gray-400"}`}
            />
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

      {current && (
        <div className="pt-6 mt-6 border-t border-outline-variant space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={currentIndex <= 0}
              className="p-3 rounded-full text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous story"
            >
              <span className="material-symbols-outlined text-2xl">skip_previous</span>
            </button>

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
  );
}
