"use client";

import { calculateReadingTime } from "@/lib/reading-time";
import { useAudioPlayerStore } from "@/store/useAudioPlayerStore";

export function ListenQueueList() {
  const queue = useAudioPlayerStore((s) => s.queue);
  const currentIndex = useAudioPlayerStore((s) => s.currentIndex);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const playArticle = useAudioPlayerStore((s) => s.playArticle);
  const removeFromQueue = useAudioPlayerStore((s) => s.removeFromQueue);

  return (
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
  );
}
