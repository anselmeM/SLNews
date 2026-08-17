import { describe, it, expect, beforeEach } from "vitest";
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

describe("useAudioPlayerStore", () => {
  beforeEach(() => {
    useAudioPlayerStore.setState({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      playbackRate: 1,
      minimized: false,
    });
  });

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
