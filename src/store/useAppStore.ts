import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NewsArticle } from '@/lib/news-service';

type Theme = "light" | "dark" | "system";

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dataSaver: boolean;
  setDataSaver: (value: boolean) => void;
  savedArticles: NewsArticle[];
  savedArticleIds: Set<string>;
  saveArticle: (article: NewsArticle) => void;
  removeArticle: (id: string) => void;
  toggleSave: (article: NewsArticle) => void;
  isSaved: (id: string) => boolean;
  setSavedIds: (ids: string[]) => void;
  preferredRegion: string | null;
  setRegion: (region: string) => void;
  preferredTopics: string[];
  toggleTopic: (topic: string) => void;
  setPreferences: (region: string | null, topics: string[]) => void;
  breakingNews: boolean;
  setBreakingNews: (v: boolean) => void;
  localAlerts: boolean;
  setLocalAlerts: (v: boolean) => void;
  recentlyViewed: NewsArticle[];
  addRecentlyViewed: (article: NewsArticle) => void;
  seenArticleIds: string[];
  addSeenArticle: (id: string) => void;
  addSeenArticles: (ids: string[]) => void;
  lastRefreshAt: number | null;
  setLastRefresh: (ts: number) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

function applyDataSaver(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("data-saver-on", enabled);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "system" as Theme,
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      dataSaver: false,
      setDataSaver: (value) => {
        set({ dataSaver: value });
        applyDataSaver(value);
      },
      savedArticles: [],
      savedArticleIds: new Set<string>(),
      saveArticle: (article) =>
        set((state) => {
          if (state.savedArticles.some((a) => a.id === article.id)) return state;
          const newIds = new Set(state.savedArticleIds);
          newIds.add(article.id);
          return {
            savedArticles: [...state.savedArticles, article],
            savedArticleIds: newIds,
          };
        }),
      removeArticle: (id) =>
        set((state) => {
          const newIds = new Set(state.savedArticleIds);
          newIds.delete(id);
          return {
            savedArticles: state.savedArticles.filter((a) => a.id !== id),
            savedArticleIds: newIds,
          };
        }),
      toggleSave: (article) => {
        const isSaved = get().isSaved(article.id);
        if (isSaved) {
          get().removeArticle(article.id);
        } else {
          get().saveArticle(article);
        }
      },
      isSaved: (id) => get().savedArticles.some((a) => a.id === id),
      setSavedIds: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          const filtered = state.savedArticles.filter((a) => idSet.has(a.id));
          return { savedArticleIds: idSet, savedArticles: filtered };
        }),
      preferredRegion: null,
      setRegion: (region) => set({ preferredRegion: region }),
      preferredTopics: [],
      toggleTopic: (topic) =>
        set((state) => ({
          preferredTopics: state.preferredTopics.includes(topic)
            ? state.preferredTopics.filter((t) => t !== topic)
            : [...state.preferredTopics, topic],
        })),
      setPreferences: (region, topics) =>
        set({ preferredRegion: region, preferredTopics: topics }),
      breakingNews: true,
      setBreakingNews: (v) => set({ breakingNews: v }),
      localAlerts: true,
      setLocalAlerts: (v) => set({ localAlerts: v }),
      recentlyViewed: [],
      addRecentlyViewed: (article) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((a) => a.id !== article.id);
          return { recentlyViewed: [article, ...filtered].slice(0, 20) };
        }),
      seenArticleIds: [],
      addSeenArticle: (id) =>
        set((state) => {
          if (state.seenArticleIds.includes(id)) return state;
          return { seenArticleIds: [...state.seenArticleIds, id].slice(-200) };
        }),
      addSeenArticles: (ids) =>
        set((state) => {
          const existing = new Set(state.seenArticleIds);
          for (const id of ids) existing.add(id);
          return { seenArticleIds: Array.from(existing).slice(-200) };
        }),
      lastRefreshAt: null,
      setLastRefresh: (ts) => set({ lastRefreshAt: ts }),
    }),
    {
      name: 'slnews-app-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          applyDataSaver(state.dataSaver);
        }
      },
    }
  )
);
