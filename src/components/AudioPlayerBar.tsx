"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAudioPlayerStore } from "@/store/useAudioPlayerStore";

export default function AudioPlayerBar() {
  const pathname = usePathname();
  const queue = useAudioPlayerStore((s) => s.queue);
  const currentIndex = useAudioPlayerStore((s) => s.currentIndex);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);
  const next = useAudioPlayerStore((s) => s.next);
  const prev = useAudioPlayerStore((s) => s.prev);
  const clearQueue = useAudioPlayerStore((s) => s.clearQueue);
  const minimized = useAudioPlayerStore((s) => s.minimized);
  const setMinimized = useAudioPlayerStore((s) => s.setMinimized);
  const init = useAudioPlayerStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  const current = queue[currentIndex];
  if (!current) return null;

  // If user is already on the dedicated /listen page, hide the floating bar to avoid duplicate controls
  if (pathname === "/listen") return null;

  if (minimized) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-fade-in">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          aria-label="Expand audio player"
        >
          <span className="material-symbols-outlined text-lg animate-pulse">
            {isPlaying ? "volume_up" : "pause"}
          </span>
          <span className="text-xs font-bold max-w-[120px] truncate">{current.title}</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Audio player"
      className="fixed bottom-[68px] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-50 bg-surface/95 dark:bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/50 rounded-2xl shadow-2xl p-3 flex items-center gap-3 animate-fade-in"
    >
      {/* Thumbnail */}
      <Link href="/listen" className="shrink-0 relative group">
        <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden relative">
          <Image
            src={current.imageUrl || "/globe.svg"}
            alt={current.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-base">open_in_full</span>
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
          <span className="truncate">{current.category}</span>
          <span>•</span>
          <span className="text-on-surface-variant">
            {currentIndex + 1}/{queue.length}
          </span>
        </div>
        <Link
          href="/listen"
          className="text-xs font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 block"
        >
          {current.title}
        </Link>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={prev}
          disabled={currentIndex <= 0}
          className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
          aria-label="Previous story"
        >
          <span className="material-symbols-outlined text-lg">skip_previous</span>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 shadow-md cursor-pointer"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          <span className="material-symbols-outlined text-xl">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        <button
          type="button"
          onClick={next}
          disabled={currentIndex >= queue.length - 1}
          className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
          aria-label="Next story"
        >
          <span className="material-symbols-outlined text-lg">skip_next</span>
        </button>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer ml-1"
          aria-label="Minimize player"
          title="Minimize player"
        >
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>

        <button
          type="button"
          onClick={clearQueue}
          className="p-1.5 rounded-full text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Close player"
          title="Close player"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </aside>
  );
}
