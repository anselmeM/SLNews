"use client";

import { useEffect } from "react";
import { ListenExploreGrid } from "./ListenExploreGrid";
import { ListenHeroPlayer } from "./ListenHeroPlayer";
import { ListenPlaylists } from "./ListenPlaylists";
import { ListenQueueList } from "./ListenQueueList";
import { useToast } from "@/components/Toast";
import type { NewsArticle } from "@/lib/news-service";
import { useAudioPlayerStore } from "@/store/useAudioPlayerStore";

export default function ListenPageClient({
  initialArticles,
}: {
  initialArticles: NewsArticle[];
}) {
  const { toast } = useToast();
  const queue = useAudioPlayerStore((s) => s.queue);
  const currentIndex = useAudioPlayerStore((s) => s.currentIndex);
  const playArticle = useAudioPlayerStore((s) => s.playArticle);
  const playQueue = useAudioPlayerStore((s) => s.playQueue);
  const addToQueue = useAudioPlayerStore((s) => s.addToQueue);
  const clearQueue = useAudioPlayerStore((s) => s.clearQueue);
  const init = useAudioPlayerStore((s) => s.init);

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
        <ListenHeroPlayer current={current} />
        <ListenQueueList />
      </div>

      {/* Curated Audio Channels */}
      <ListenPlaylists
        articles={initialArticles}
        onPlayCurated={handlePlayAllCurated}
      />

      {/* Explore More Stories to Queue */}
      <ListenExploreGrid
        articles={initialArticles}
        onPlayArticle={playArticle}
        onAddToQueue={handleAddStory}
      />
    </div>
  );
}
