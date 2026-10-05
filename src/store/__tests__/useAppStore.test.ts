import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

function article(id: string): NewsArticle {
  return {
    id,
    title: `Article ${id}`,
    summary: "summary",
    content: "content",
    imageUrl: "https://example.com/image.jpg",
    category: "National",
    source: "SLNews",
    publishedAt: "2026-10-03T00:00:00.000Z",
    authorId: "author-1",
  };
}

/** Data-only slice — setState merges, so the actions survive this reset. */
const DEFAULTS = {
  theme: "system" as const,
  dataSaver: false,
  fontSize: "normal" as const,
  savedArticles: [] as NewsArticle[],
  savedArticleIds: new Set<string>(),
  preferredTopics: [] as string[],
  breakingNews: true,
  localAlerts: true,
  recentlyViewed: [] as NewsArticle[],
  seenArticleIds: [] as string[],
  lastRefreshAt: null,
};

beforeEach(() => {
  useAppStore.setState(DEFAULTS);
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.body.classList.remove("data-saver-on");
  vi.unstubAllGlobals();
});

describe("useAppStore — saved articles", () => {
  it("saves an article and tracks its id", () => {
    useAppStore.getState().saveArticle(article("a"));

    const { savedArticles, savedArticleIds } = useAppStore.getState();
    expect(savedArticles.map((a) => a.id)).toEqual(["a"]);
    expect([...savedArticleIds]).toEqual(["a"]);
  });

  it("ignores a duplicate save", () => {
    useAppStore.getState().saveArticle(article("a"));
    useAppStore.getState().saveArticle(article("a"));

    expect(useAppStore.getState().savedArticles).toHaveLength(1);
  });

  it("removes an article and its id", () => {
    useAppStore.getState().saveArticle(article("a"));
    useAppStore.getState().saveArticle(article("b"));
    useAppStore.getState().removeArticle("a");

    const { savedArticles, savedArticleIds } = useAppStore.getState();
    expect(savedArticles.map((a) => a.id)).toEqual(["b"]);
    expect([...savedArticleIds]).toEqual(["b"]);
  });

  it("removes an id that was never saved without throwing", () => {
    useAppStore.getState().removeArticle("nope");
    expect(useAppStore.getState().savedArticles).toEqual([]);
  });

  it("toggles save on and back off", () => {
    const { toggleSave, isSaved } = useAppStore.getState();

    toggleSave(article("a"));
    expect(useAppStore.getState().isSaved("a")).toBe(true);

    useAppStore.getState().toggleSave(article("a"));
    expect(useAppStore.getState().isSaved("a")).toBe(false);
    expect(isSaved).toBeTypeOf("function");
  });

  it("setSavedIds narrows savedArticles to the ids that still exist", () => {
    useAppStore.getState().saveArticle(article("a"));
    useAppStore.getState().saveArticle(article("b"));

    // "c" is known to the server but has no local copy, so it must NOT appear
    // in savedArticles — only the ids are authoritative here.
    useAppStore.getState().setSavedIds(["b", "c"]);

    const { savedArticles, savedArticleIds } = useAppStore.getState();
    expect([...savedArticleIds].sort()).toEqual(["b", "c"]);
    expect(savedArticles.map((a) => a.id)).toEqual(["b"]);
  });
});

describe("useAppStore — recently viewed", () => {
  it("prepends the newest and dedupes an existing entry", () => {
    useAppStore.getState().addRecentlyViewed(article("a"));
    useAppStore.getState().addRecentlyViewed(article("b"));
    useAppStore.getState().addRecentlyViewed(article("a"));

    expect(useAppStore.getState().recentlyViewed.map((a) => a.id)).toEqual(["a", "b"]);
  });

  it("caps the list at 20, dropping the oldest", () => {
    for (let i = 0; i < 22; i++) {
      useAppStore.getState().addRecentlyViewed(article(`a${i}`));
    }

    const viewed = useAppStore.getState().recentlyViewed;
    expect(viewed).toHaveLength(20);
    expect(viewed[0]?.id).toBe("a21");
    expect(viewed.map((a) => a.id)).not.toContain("a0");
  });
});

describe("useAppStore — seen articles", () => {
  it("ignores an id that is already seen", () => {
    useAppStore.getState().addSeenArticle("a");
    useAppStore.getState().addSeenArticle("a");
    expect(useAppStore.getState().seenArticleIds).toEqual(["a"]);
  });

  it("caps at 200, keeping the most recent", () => {
    for (let i = 0; i < 205; i++) {
      useAppStore.getState().addSeenArticle(`a${i}`);
    }

    const seen = useAppStore.getState().seenArticleIds;
    expect(seen).toHaveLength(200);
    expect(seen).not.toContain("a0");
    expect(seen).toContain("a204");
  });

  it("merges a batch and dedupes against what is already seen", () => {
    useAppStore.getState().addSeenArticle("a");
    useAppStore.getState().addSeenArticles(["a", "b", "c"]);

    expect(useAppStore.getState().seenArticleIds).toEqual(["a", "b", "c"]);
  });
});

describe("useAppStore — simple preferences", () => {
  it("sets font size, preferences, alerts and refresh time", () => {
    const s = useAppStore.getState();

    s.setFontSize("xlarge");
    s.setPreferences(["Tech"]);
    s.setBreakingNews(false);
    s.setLocalAlerts(false);
    s.setLastRefresh(1234);

    const next = useAppStore.getState();
    expect(next.fontSize).toBe("xlarge");
    expect(next.preferredTopics).toEqual(["Tech"]);
    expect(next.breakingNews).toBe(false);
    expect(next.localAlerts).toBe(false);
    expect(next.lastRefreshAt).toBe(1234);
  });
});

describe("useAppStore — data saver", () => {
  it("toggles the body class alongside the flag", () => {
    useAppStore.getState().setDataSaver(true);
    expect(useAppStore.getState().dataSaver).toBe(true);
    expect(document.body.classList.contains("data-saver-on")).toBe(true);

    useAppStore.getState().setDataSaver(false);
    expect(document.body.classList.contains("data-saver-on")).toBe(false);
  });
});

describe("useAppStore — theme", () => {
  it("follows the system preference when it is set to dark", () => {
    // jsdom does not implement matchMedia, so this branch is otherwise dead.
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    useAppStore.getState().setTheme("system");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("stays light under system when the preference is not dark", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    useAppStore.getState().setTheme("system");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("useAppStore — persistence", () => {
  function options() {
    return useAppStore.persist.getOptions();
  }

  it("partialize drops savedArticleIds, which is not JSON-serializable", () => {
    const partialize = options().partialize as (s: unknown) => Record<string, unknown>;
    const persisted = partialize({
      ...DEFAULTS,
      savedArticles: [article("a")],
      savedArticleIds: new Set(["a"]),
    });

    expect(persisted).not.toHaveProperty("savedArticleIds");
    expect(persisted).toHaveProperty("savedArticles");
  });

  it("migrate normalises pre-v3 state, drops the dead region key and renames topics", () => {
    const migrate = options().migrate as (
      s: unknown,
      v: number
    ) => Record<string, unknown>;

    const migrated = migrate(
      { preferredRegion: "Western Area", preferredTopics: ["Technology", "Sports"] },
      1
    );

    expect(migrated).not.toHaveProperty("preferredRegion");
    expect(migrated.preferredTopics).toEqual(["Tech", "Sports"]);
  });

  it("migrate strips a persisted region from the current-1 version too", () => {
    const migrate = options().migrate as (
      s: unknown,
      v: number
    ) => Record<string, unknown>;

    const migrated = migrate(
      { preferredRegion: "Bo", preferredTopics: ["Sports"] },
      2
    );

    expect(migrated).not.toHaveProperty("preferredRegion");
    expect(migrated.preferredTopics).toEqual(["Sports"]);
  });

  it("migrate leaves already-current state untouched", () => {
    const migrate = options().migrate as (
      s: unknown,
      v: number
    ) => Record<string, unknown>;

    const state = { preferredTopics: ["Sports"] };
    expect(migrate(state, 3)).toEqual(state);
  });

  it("rehydrating rebuilds savedArticleIds and applies the stored theme", async () => {
    localStorage.setItem(
      "slnews-app-storage",
      JSON.stringify({
        state: {
          theme: "dark",
          dataSaver: true,
          savedArticles: [article("a"), article("b")],
        },
        version: 2,
      })
    );

    await useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect([...state.savedArticleIds].sort()).toEqual(["a", "b"]);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.body.classList.contains("data-saver-on")).toBe(true);
  });
});
