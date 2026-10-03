import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NewsArticle } from "@/lib/news-service";
import { useAudioPlayerStore } from "@/store/useAudioPlayerStore";

const makeStory = (id: string, title: string): NewsArticle => ({
  id,
  title,
  summary: `Summary of ${title}`,
  content: `Content of ${title}`,
  imageUrl: `https://example.com/${id}.jpg`,
  category: "National",
  source: "SLNews",
  publishedAt: new Date().toISOString(),
  authorId: "author-1",
});

/** Long enough to need several 180-char chunks. */
const makeLongStory = (id = "long"): NewsArticle => ({
  ...makeStory(id, "Long story"),
  content: Array.from(
    { length: 8 },
    (_, i) => `Sentence number ${i} carries roughly forty characters here.`
  ).join(" "),
});

/**
 * Neither jsdom nor node implements speech synthesis, and the store reads
 * `window.speechSynthesis` / `SpeechSynthesisUtterance` directly. A controllable
 * fake is better than a real implementation here anyway: the tests need to fire
 * `onend`/`onerror` on demand to walk the chunk chain deterministically.
 */
class FakeUtterance {
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  rate = 1;
  pitch = 1;
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

type SpeechFake = {
  spoken: FakeUtterance[];
  synthesis: {
    paused: boolean;
    speak: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };
};

function installSpeech(): SpeechFake {
  const spoken: FakeUtterance[] = [];
  const synthesis = {
    paused: false,
    speak: vi.fn((u: FakeUtterance) => {
      spoken.push(u);
    }),
    pause: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
  };

  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  vi.stubGlobal("window", { speechSynthesis: synthesis });

  return { spoken, synthesis };
}

/** The utterance currently being "spoken". */
const current = (spoken: FakeUtterance[]) => spoken[spoken.length - 1];

/** Fire onend until the queue drains or the guard trips. */
function drainChunks(spoken: FakeUtterance[], max = 30) {
  for (let i = 0; i < max; i++) {
    if (!useAudioPlayerStore.getState().isPlaying) break;
    const u = current(spoken);
    if (!u || !u.onend) break;
    u.onend();
  }
}

beforeEach(() => {
  useAudioPlayerStore.setState({
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    playbackRate: 1,
    isSupported: true,
    minimized: false,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useAudioPlayerStore", () => {
  it("adds articles to queue without duplicate IDs", () => {
    const s1 = makeStory("1", "Story 1");
    const s2 = makeStory("2", "Story 2");

    useAudioPlayerStore.getState().addToQueue(s1);
    expect(useAudioPlayerStore.getState().queue.length).toBe(1);

    useAudioPlayerStore.getState().addToQueue(s1);
    expect(useAudioPlayerStore.getState().queue.length).toBe(1);

    useAudioPlayerStore.getState().addToQueue(s2);
    expect(useAudioPlayerStore.getState().queue.length).toBe(2);
  });

  it("plays a queue of articles from start index", () => {
    const list = [makeStory("1", "S1"), makeStory("2", "S2"), makeStory("3", "S3")];
    useAudioPlayerStore.getState().playQueue(list, 1);

    expect(useAudioPlayerStore.getState().queue).toEqual(list);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(1);
    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
  });

  it("advances next and previous properly", () => {
    const list = [makeStory("1", "S1"), makeStory("2", "S2"), makeStory("3", "S3")];
    useAudioPlayerStore.getState().playQueue(list, 0);

    useAudioPlayerStore.getState().next();
    expect(useAudioPlayerStore.getState().currentIndex).toBe(1);

    useAudioPlayerStore.getState().next();
    expect(useAudioPlayerStore.getState().currentIndex).toBe(2);

    useAudioPlayerStore.getState().prev();
    expect(useAudioPlayerStore.getState().currentIndex).toBe(1);
  });

  it("removes items from queue and adjusts index", () => {
    const list = [makeStory("1", "S1"), makeStory("2", "S2"), makeStory("3", "S3")];
    useAudioPlayerStore.getState().playQueue(list, 1);

    // Remove item at index 0 (before current)
    useAudioPlayerStore.getState().removeFromQueue(0);
    expect(useAudioPlayerStore.getState().queue.length).toBe(2);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(0);
    expect(useAudioPlayerStore.getState().queue[0]?.id).toBe("2");
  });

  it("updates playback rate", () => {
    useAudioPlayerStore.getState().setRate(1.5);
    expect(useAudioPlayerStore.getState().playbackRate).toBe(1.5);
  });

  it("clears queue completely", () => {
    const list = [makeStory("1", "S1")];
    useAudioPlayerStore.getState().playQueue(list, 0);
    useAudioPlayerStore.getState().clearQueue();

    expect(useAudioPlayerStore.getState().queue).toEqual([]);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(-1);
    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });
});

describe("useAudioPlayerStore — without speech support", () => {
  it("init() leaves isSupported optimistic when there is no window", () => {
    useAudioPlayerStore.setState({ isSupported: true });
    useAudioPlayerStore.getState().init();

    // Nothing can be probed server-side, so the default stands rather than
    // reporting unsupported and hiding the player on first paint.
    expect(useAudioPlayerStore.getState().isSupported).toBe(true);
  });

  it("init() reports unsupported when window lacks speechSynthesis", () => {
    vi.stubGlobal("window", {});
    useAudioPlayerStore.getState().init();

    expect(useAudioPlayerStore.getState().isSupported).toBe(false);
  });

  it("init() reports supported when speechSynthesis exists", () => {
    installSpeech();
    useAudioPlayerStore.getState().init();
    expect(useAudioPlayerStore.getState().isSupported).toBe(true);
  });

  it("togglePlay is a no-op with no speech support", () => {
    const list = [makeStory("1", "S1")];
    useAudioPlayerStore.setState({ queue: list, currentIndex: 0, isPlaying: false });

    useAudioPlayerStore.getState().togglePlay();

    // Nothing to resume into, and no speech API to resume with.
    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });
});

describe("useAudioPlayerStore — queue management", () => {
  it("playQueue ignores an empty list", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playQueue([]);

    expect(useAudioPlayerStore.getState().queue).toEqual([]);
    expect(spoken).toHaveLength(0);
  });

  it("playQueue clamps an out-of-range start index to the last article", () => {
    const list = [makeStory("1", "S1"), makeStory("2", "S2")];
    useAudioPlayerStore.getState().playQueue(list, 99);

    expect(useAudioPlayerStore.getState().currentIndex).toBe(1);
  });

  it("playQueue clamps a negative start index to zero", () => {
    const list = [makeStory("1", "S1"), makeStory("2", "S2")];
    useAudioPlayerStore.getState().playQueue(list, -5);

    expect(useAudioPlayerStore.getState().currentIndex).toBe(0);
  });

  it("playArticle puts a new article first and starts it", () => {
    const { spoken } = installSpeech();
    const existing = makeStory("1", "S1");
    const fresh = makeStory("2", "S2");
    useAudioPlayerStore.setState({ queue: [existing], currentIndex: 0 });

    useAudioPlayerStore.getState().playArticle(fresh);

    const state = useAudioPlayerStore.getState();
    expect(state.queue.map((a) => a.id)).toEqual(["2", "1"]);
    expect(state.currentIndex).toBe(0);
    expect(state.isPlaying).toBe(true);
    expect(spoken).toHaveLength(1);
  });

  it("playArticle reuses the existing queue slot instead of duplicating", () => {
    installSpeech();
    const a = makeStory("1", "S1");
    const b = makeStory("2", "S2");
    useAudioPlayerStore.setState({ queue: [a, b], currentIndex: 0 });

    useAudioPlayerStore.getState().playArticle(b);

    const state = useAudioPlayerStore.getState();
    expect(state.queue.map((x) => x.id)).toEqual(["1", "2"]);
    expect(state.currentIndex).toBe(1);
  });

  it("addToQueue starts playback when nothing is playing", () => {
    installSpeech();
    useAudioPlayerStore.getState().addToQueue(makeStory("1", "S1"));

    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(0);
  });

  it("addToQueue leaves playback alone when something is already playing", () => {
    installSpeech();
    useAudioPlayerStore.getState().playQueue([makeStory("1", "S1")], 0);
    const before = useAudioPlayerStore.getState().currentIndex;

    useAudioPlayerStore.getState().addToQueue(makeStory("2", "S2"));

    const state = useAudioPlayerStore.getState();
    expect(state.queue).toHaveLength(2);
    expect(state.currentIndex).toBe(before);
  });

  it("removeFromQueue of the last remaining item clears the queue", () => {
    const { synthesis } = installSpeech();
    useAudioPlayerStore.setState({ queue: [makeStory("1", "S1")], currentIndex: 0 });

    useAudioPlayerStore.getState().removeFromQueue(0);

    expect(useAudioPlayerStore.getState().queue).toEqual([]);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(-1);
    expect(synthesis.cancel).toHaveBeenCalled();
  });

  it("removeFromQueue of the current item moves playback to the next one", () => {
    const { spoken } = installSpeech();
    const list = [makeStory("1", "S1"), makeStory("2", "S2"), makeStory("3", "S3")];
    useAudioPlayerStore.getState().playQueue(list, 1);
    const spokenBefore = spoken.length;

    useAudioPlayerStore.getState().removeFromQueue(1);

    const state = useAudioPlayerStore.getState();
    expect(state.queue.map((a) => a.id)).toEqual(["1", "3"]);
    expect(state.currentIndex).toBe(1);
    expect(spoken.length).toBeGreaterThan(spokenBefore);
  });

  it("removeFromQueue of an item after the current one leaves the index alone", () => {
    installSpeech();
    const list = [makeStory("1", "S1"), makeStory("2", "S2"), makeStory("3", "S3")];
    useAudioPlayerStore.getState().playQueue(list, 0);

    useAudioPlayerStore.getState().removeFromQueue(2);

    expect(useAudioPlayerStore.getState().currentIndex).toBe(0);
    expect(useAudioPlayerStore.getState().queue.map((a) => a.id)).toEqual(["1", "2"]);
  });

  it("getCurrentArticle returns the current article and null when out of range", () => {
    const list = [makeStory("1", "S1")];
    useAudioPlayerStore.setState({ queue: list, currentIndex: 0 });
    expect(useAudioPlayerStore.getState().getCurrentArticle()?.id).toBe("1");

    useAudioPlayerStore.setState({ currentIndex: -1 });
    expect(useAudioPlayerStore.getState().getCurrentArticle()).toBeNull();

    useAudioPlayerStore.setState({ currentIndex: 5 });
    expect(useAudioPlayerStore.getState().getCurrentArticle()).toBeNull();
  });

  it("setMinimized toggles the minimized flag", () => {
    useAudioPlayerStore.getState().setMinimized(true);
    expect(useAudioPlayerStore.getState().minimized).toBe(true);
    useAudioPlayerStore.getState().setMinimized(false);
    expect(useAudioPlayerStore.getState().minimized).toBe(false);
  });
});

describe("useAudioPlayerStore — navigation edges", () => {
  it("next() past the end stops playback", () => {
    const { synthesis } = installSpeech();
    useAudioPlayerStore.setState({ queue: [makeStory("1", "S1")], currentIndex: 0 });

    useAudioPlayerStore.getState().next();

    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    expect(synthesis.cancel).toHaveBeenCalled();
  });

  it("prev() at the first item restarts it rather than going negative", () => {
    const { spoken } = installSpeech();
    const list = [makeStory("1", "S1"), makeStory("2", "S2")];
    useAudioPlayerStore.getState().playQueue(list, 0);
    const spokenBefore = spoken.length;

    useAudioPlayerStore.getState().prev();

    expect(useAudioPlayerStore.getState().currentIndex).toBe(0);
    expect(spoken.length).toBeGreaterThan(spokenBefore);
  });

  it("setRate while playing restarts speech at the new rate", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playQueue([makeStory("1", "S1")], 0);

    useAudioPlayerStore.getState().setRate(2);

    expect(useAudioPlayerStore.getState().playbackRate).toBe(2);
    expect(current(spoken)?.rate).toBe(2);
  });

  it("setRate while paused does not restart speech", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.setState({
      queue: [makeStory("1", "S1")],
      currentIndex: 0,
      isPlaying: false,
    });
    const spokenBefore = spoken.length;

    useAudioPlayerStore.getState().setRate(0.75);

    expect(spoken.length).toBe(spokenBefore);
  });
});

describe("useAudioPlayerStore — togglePlay", () => {
  it("pauses when playing", () => {
    const { synthesis } = installSpeech();
    useAudioPlayerStore.setState({ isPlaying: true });

    useAudioPlayerStore.getState().togglePlay();

    expect(synthesis.pause).toHaveBeenCalled();
    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });

  it("resumes when the synthesiser is paused", () => {
    const { synthesis } = installSpeech();
    synthesis.paused = true;
    useAudioPlayerStore.setState({ isPlaying: false });

    useAudioPlayerStore.getState().togglePlay();

    expect(synthesis.resume).toHaveBeenCalled();
    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
  });

  it("re-speaks the current article when not paused", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.setState({
      queue: [makeStory("1", "S1")],
      currentIndex: 0,
      isPlaying: false,
    });

    useAudioPlayerStore.getState().togglePlay();

    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    expect(spoken).toHaveLength(1);
  });

  it("does nothing when the queue has no current article", () => {
    installSpeech();
    useAudioPlayerStore.setState({ queue: [], currentIndex: 0, isPlaying: false });

    useAudioPlayerStore.getState().togglePlay();

    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });
});

describe("useAudioPlayerStore — chunking and speech errors", () => {
  it("splits long content into chunks of at most 180 characters", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeLongStory());

    drainChunks(spoken);

    expect(spoken.length).toBeGreaterThan(1);
    for (const u of spoken) {
      expect(u.text.length).toBeLessThanOrEqual(180);
    }
  });

  it("starts the spoken text with the article title", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeStory("1", "Headline"));

    expect(spoken[0]?.text.startsWith("Headline.")).toBe(true);
  });

  it("falls back to the summary when content is empty", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle({
      ...makeStory("1", "Headline"),
      content: "",
      summary: "Only a summary",
    });

    expect(spoken[0]?.text).toContain("Only a summary");
  });

  it("finishing every chunk stops playback when nothing follows", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeLongStory());

    drainChunks(spoken);

    // onEnd walks the queue via next(); with a single article that ends playback.
    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });

  it("an 'interrupted' error does not stop playback", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeStory("1", "S1"));

    current(spoken)?.onerror?.({ error: "interrupted" });

    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
  });

  it("a 'canceled' error does not stop playback", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeStory("1", "S1"));

    current(spoken)?.onerror?.({ error: "canceled" });

    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
  });

  it("a real speech error stops playback", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeStory("1", "S1"));

    current(spoken)?.onerror?.({ error: "synthesis-failed" });

    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });

  it("a throwing speak() stops playback instead of crashing", () => {
    const { synthesis } = installSpeech();
    synthesis.speak.mockImplementation(() => {
      throw new Error("speech unavailable");
    });

    useAudioPlayerStore.getState().playArticle(makeStory("1", "S1"));

    expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
  });

  it("a stale utterance does not advance once playback was restarted", () => {
    const { spoken } = installSpeech();
    useAudioPlayerStore.getState().playArticle(makeLongStory("first"));

    const stale = current(spoken);
    // Restarting bumps the session id, orphaning the in-flight utterance.
    useAudioPlayerStore.getState().playArticle(makeLongStory("second"));
    const spokenAfterRestart = spoken.length;

    stale?.onend?.();

    expect(spoken.length).toBe(spokenAfterRestart);
  });

  it("splits a single over-long sentence at word boundaries", () => {
    const { spoken } = installSpeech();
    // One sentence with no internal full stop, well past the 180-char limit, so
    // chunkText has to fall back to splitting on words.
    const oneLongSentence = "word ".repeat(60).trim();

    useAudioPlayerStore.getState().playArticle({
      ...makeStory("1", "S"),
      content: oneLongSentence,
    });
    drainChunks(spoken);

    expect(spoken.length).toBeGreaterThan(1);
    for (const u of spoken) {
      expect(u.text.length).toBeLessThanOrEqual(180);
    }
  });

  it("survives a throwing speechSynthesis.cancel()", () => {
    const { synthesis } = installSpeech();
    synthesis.cancel.mockImplementation(() => {
      throw new Error("cancel failed");
    });
    useAudioPlayerStore.setState({
      queue: [makeStory("1", "S1")],
      currentIndex: 0,
      isPlaying: true,
    });

    expect(() => useAudioPlayerStore.getState().clearQueue()).not.toThrow();
    expect(useAudioPlayerStore.getState().queue).toEqual([]);
  });
});
