import { create } from "zustand";
import type { NewsArticle } from "@/lib/news-service";

export type PlaybackRate = 0.75 | 1 | 1.25 | 1.5 | 2;

interface AudioPlayerState {
  queue: NewsArticle[];
  currentIndex: number;
  isPlaying: boolean;
  playbackRate: PlaybackRate;
  isSupported: boolean;
  minimized: boolean;
  
  // Actions
  init: () => void;
  playArticle: (article: NewsArticle) => void;
  playQueue: (articles: NewsArticle[], startIndex?: number) => void;
  addToQueue: (article: NewsArticle) => void;
  removeFromQueue: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  setRate: (rate: PlaybackRate) => void;
  setMinimized: (minimized: boolean) => void;
  clearQueue: () => void;
  getCurrentArticle: () => NewsArticle | null;
}

function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakArticle(
  article: NewsArticle,
  rate: number,
  onEnd: () => void,
  onError: () => void
) {
  stopSpeech();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const contentClean = (article.content || article.summary || "").replace(/\n+/g, ". ");
  const text = `${article.title}. ${contentClean}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.onend = () => {
    onEnd();
  };
  utterance.onerror = () => {
    onError();
  };

  window.speechSynthesis.speak(utterance);
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  playbackRate: 1,
  isSupported: true,
  minimized: false,

  init: () => {
    if (typeof window !== "undefined") {
      set({ isSupported: "speechSynthesis" in window });
    }
  },

  getCurrentArticle: () => {
    const { queue, currentIndex } = get();
    if (currentIndex >= 0 && currentIndex < queue.length) {
      return queue[currentIndex] || null;
    }
    return null;
  },

  playArticle: (article) => {
    const { queue, playbackRate } = get();
    const existingIndex = queue.findIndex((a) => a.id === article.id);

    let nextQueue = [...queue];
    let nextIndex = existingIndex;

    if (existingIndex === -1) {
      nextQueue = [article, ...queue];
      nextIndex = 0;
    }

    set({ queue: nextQueue, currentIndex: nextIndex, isPlaying: true, minimized: false });

    speakArticle(
      article,
      playbackRate,
      () => get().next(),
      () => set({ isPlaying: false })
    );
  },

  playQueue: (articles, startIndex = 0) => {
    if (articles.length === 0) return;
    const { playbackRate } = get();
    const safeIndex = Math.min(Math.max(0, startIndex), articles.length - 1);
    const targetArticle = articles[safeIndex];

    if (!targetArticle) return;

    set({ queue: articles, currentIndex: safeIndex, isPlaying: true, minimized: false });

    speakArticle(
      targetArticle,
      playbackRate,
      () => get().next(),
      () => set({ isPlaying: false })
    );
  },

  addToQueue: (article) => {
    const { queue, currentIndex, isPlaying } = get();
    if (queue.some((a) => a.id === article.id)) return;

    const nextQueue = [...queue, article];
    set({ queue: nextQueue });

    if (currentIndex === -1 || !isPlaying) {
      get().playArticle(article);
    }
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const nextQueue = queue.filter((_, i) => i !== index);

    if (nextQueue.length === 0) {
      get().clearQueue();
      return;
    }

    let nextIndex = currentIndex;
    if (index === currentIndex) {
      stopSpeech();
      nextIndex = Math.min(currentIndex, nextQueue.length - 1);
      const nextArticle = nextQueue[nextIndex];
      set({ queue: nextQueue, currentIndex: nextIndex });
      if (nextArticle) {
        speakArticle(
          nextArticle,
          get().playbackRate,
          () => get().next(),
          () => set({ isPlaying: false })
        );
      }
    } else if (index < currentIndex) {
      nextIndex = currentIndex - 1;
      set({ queue: nextQueue, currentIndex: nextIndex });
    } else {
      set({ queue: nextQueue });
    }
  },

  togglePlay: () => {
    const { isPlaying, queue, currentIndex, playbackRate } = get();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      set({ isPlaying: false });
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        set({ isPlaying: true });
      } else {
        const currentArticle = queue[currentIndex];
        if (currentArticle) {
          set({ isPlaying: true });
          speakArticle(
            currentArticle,
            playbackRate,
            () => get().next(),
            () => set({ isPlaying: false })
          );
        }
      }
    }
  },

  next: () => {
    const { queue, currentIndex, playbackRate } = get();
    if (currentIndex + 1 < queue.length) {
      const nextIndex = currentIndex + 1;
      const nextArticle = queue[nextIndex];
      if (nextArticle) {
        set({ currentIndex: nextIndex, isPlaying: true });
        speakArticle(
          nextArticle,
          playbackRate,
          () => get().next(),
          () => set({ isPlaying: false })
        );
      }
    } else {
      stopSpeech();
      set({ isPlaying: false });
    }
  },

  prev: () => {
    const { queue, currentIndex, playbackRate } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevArticle = queue[prevIndex];
      if (prevArticle) {
        set({ currentIndex: prevIndex, isPlaying: true });
        speakArticle(
          prevArticle,
          playbackRate,
          () => get().next(),
          () => set({ isPlaying: false })
        );
      }
    } else if (queue[0]) {
      // Restart current
      speakArticle(
        queue[0],
        playbackRate,
        () => get().next(),
        () => set({ isPlaying: false })
      );
    }
  },

  setRate: (rate) => {
    const { queue, currentIndex, isPlaying } = get();
    set({ playbackRate: rate });
    const currentArticle = queue[currentIndex];
    if (isPlaying && currentArticle) {
      speakArticle(
        currentArticle,
        rate,
        () => get().next(),
        () => set({ isPlaying: false })
      );
    }
  },

  setMinimized: (minimized) => set({ minimized }),

  clearQueue: () => {
    stopSpeech();
    set({ queue: [], currentIndex: -1, isPlaying: false });
  },
}));
