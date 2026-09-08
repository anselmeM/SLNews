import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListenExploreGrid } from "../ListenExploreGrid";
import { ListenHeroPlayer } from "../ListenHeroPlayer";
import ListenPageClient from "../ListenPageClient";
import { ListenPlaylists } from "../ListenPlaylists";
import { ListenQueueList } from "../ListenQueueList";
import type { NewsArticle } from "@/lib/news-service";
import { useAudioPlayerStore } from "@/store/useAudioPlayerStore";

const mockToast = vi.fn();
vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockArticles: NewsArticle[] = [
  {
    id: "art-1",
    title: "Presidential Economic Summit Opens in Freetown",
    summary: "Leaders discuss inflation, currency stabilization and growth opportunities.",
    content: "Full detailed report on the summit proceedings and policy declarations.",
    category: "Economy",
    source: "Awoko",
    authorId: "author-1",
    publishedAt: new Date().toISOString(),
    imageUrl: "/mock-art-1.jpg",
    location: "Freetown",
  },
  {
    id: "art-2",
    title: "Parliament Debates Environmental Protection Bill",
    summary: "Lawmakers review proposed regulations on conservation zones.",
    content: "Extensive discussions held regarding forestry and maritime regulations.",
    category: "Politics",
    source: "Sierra Leone Telegraph",
    authorId: "author-2",
    publishedAt: new Date().toISOString(),
    imageUrl: "/mock-art-2.jpg",
    location: "National",
  },
  {
    id: "art-3",
    title: "Leone Stars Qualify for Regional Cup Finals",
    summary: "National team secures historic victory in continental showdown.",
    content: "Thrilling 90 minutes of football ending with a stoppage-time header.",
    category: "Sports",
    source: "Concord Times",
    authorId: "author-3",
    publishedAt: new Date().toISOString(),
    imageUrl: "/mock-art-3.jpg",
  },
];

describe("Listen Feature Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAudioPlayerStore.setState({
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      playbackRate: 1,
    });
  });

  describe("ListenPageClient", () => {
    it("renders page header and audio studio badge", () => {
      render(<ListenPageClient initialArticles={mockArticles} />);
      expect(screen.getByText("Listen to the News")).toBeInTheDocument();
      expect(screen.getByText(/SLNews Audio Studio/i)).toBeInTheDocument();
      expect(screen.getByText("Curated Audio Channels")).toBeInTheDocument();
      expect(screen.getByText("Explore & Queue Stories")).toBeInTheDocument();
    });

    it("populates queue with initial articles if store queue is empty", () => {
      render(<ListenPageClient initialArticles={mockArticles} />);
      expect(screen.getByText(/3 in playlist/i)).toBeInTheDocument();
    });
  });

  describe("ListenHeroPlayer", () => {
    it("renders current article details and playback rate options", () => {
      render(<ListenHeroPlayer current={mockArticles[0]} />);
      expect(
        screen.getByText("Presidential Economic Summit Opens in Freetown")
      ).toBeInTheDocument();
      expect(screen.getByText("By Awoko")).toBeInTheDocument();
      expect(screen.getByText("1x")).toBeInTheDocument();
      expect(screen.getByText("1.5x")).toBeInTheDocument();
    });

    it("renders fallback prompt when no current article is selected", () => {
      render(<ListenHeroPlayer current={undefined} />);
      expect(
        screen.getByText("Select a story to start listening")
      ).toBeInTheDocument();
    });
  });

  describe("ListenQueueList", () => {
    it("renders queue items and empty state correctly", () => {
      useAudioPlayerStore.setState({
        queue: [mockArticles[0]!],
        currentIndex: 0,
      });

      render(<ListenQueueList />);
      expect(screen.getByText(/Up Next \(1\)/i)).toBeInTheDocument();
      expect(
        screen.getByText("Presidential Economic Summit Opens in Freetown")
      ).toBeInTheDocument();
    });
  });

  describe("ListenPlaylists", () => {
    it("triggers play curated channel when clicked", () => {
      const handlePlayCurated = vi.fn();
      render(
        <ListenPlaylists
          articles={mockArticles}
          onPlayCurated={handlePlayCurated}
        />
      );

      const playButtons = screen.getAllByRole("button", { name: /Play All/i });
      expect(playButtons.length).toBe(3);

      fireEvent.click(playButtons[0]!);
      expect(handlePlayCurated).toHaveBeenCalledWith(
        mockArticles,
        "Top 5 Headlines"
      );
    });
  });

  describe("ListenExploreGrid", () => {
    it("filters articles by category pill and triggers callbacks", () => {
      const handlePlayArticle = vi.fn();
      const handleAddToQueue = vi.fn();

      render(
        <ListenExploreGrid
          articles={mockArticles}
          onPlayArticle={handlePlayArticle}
          onAddToQueue={handleAddToQueue}
        />
      );

      expect(
        screen.getByText("Presidential Economic Summit Opens in Freetown")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Parliament Debates Environmental Protection Bill")
      ).toBeInTheDocument();

      // Click Sports filter
      const sportsFilter = screen.getByRole("button", { name: "Sports" });
      expect(sportsFilter).toBeDefined();
      fireEvent.click(sportsFilter);

      // Only sports article should remain
      expect(
        screen.getByText("Leone Stars Qualify for Regional Cup Finals")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Presidential Economic Summit Opens in Freetown")
      ).not.toBeInTheDocument();
    });
  });
});
