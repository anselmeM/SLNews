import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PaginatedNewsFeed from "@/components/PaginatedNewsFeed";
import type { NewsArticle } from "@/lib/news-service";

const makeArticle = (id: string): NewsArticle => ({
  id,
  title: `Article ${id}`,
  summary: "Summary",
  content: "Content",
  imageUrl: "/test.jpg",
  category: "News",
  source: "Test Source",
  publishedAt: new Date().toISOString(),
  authorId: `author-${id}`,
});

const makePage = (start: number, count: number): NewsArticle[] =>
  Array.from({ length: count }, (_, i) => makeArticle(`a-${start + i}`));

describe("PaginatedNewsFeed", () => {
  it("renders initial articles", () => {
    const initial = makePage(0, 3);
    render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={vi.fn()} emptyMessage="Nothing here." />
    );
    expect(screen.getByText("Article a-0")).toBeInTheDocument();
    expect(screen.getByText("Article a-2")).toBeInTheDocument();
  });

  it("shows More Articles button when the initial page is full", () => {
    const initial = makePage(0, 10);
    render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={vi.fn()} emptyMessage="Nothing here." />
    );
    expect(screen.getByText("More Articles")).toBeInTheDocument();
  });

  it("hides More Articles button when the initial page is short", () => {
    const initial = makePage(0, 3);
    render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={vi.fn()} emptyMessage="Nothing here." />
    );
    expect(screen.queryByText("More Articles")).not.toBeInTheDocument();
  });

  it("loads and appends the next page, deduping overlapping ids", async () => {
    // Next page: one overlapping id (a-9) + 9 new articles = 10 items.
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce([makeArticle("a-9"), ...makePage(10, 9)]);
    const initial = makePage(0, 10);
    render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );

    fireEvent.click(screen.getByText("More Articles"));

    await waitFor(() => {
      expect(screen.getByText("Article a-10")).toBeInTheDocument();
    });
    // a-9 was already present: appended page deduped it (still exactly one).
    expect(screen.getAllByText("Article a-9").length).toBe(1);
    expect(screen.getByText("Article a-18")).toBeInTheDocument();
  });

  it("hides the More Articles button once results are exhausted", async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce([]);
    const initial = makePage(0, 10);
    render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );

    fireEvent.click(screen.getByText("More Articles"));

    await waitFor(() => {
      expect(screen.queryByText("More Articles")).not.toBeInTheDocument();
    });
  });

  it("shows a message when loading more fails", async () => {
    const fetchPage = vi.fn().mockRejectedValueOnce(new Error("boom"));
    const initial = makePage(0, 10);
    render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );

    fireEvent.click(screen.getByText("More Articles"));

    await waitFor(() => {
      expect(screen.getByText(/Couldn't load more articles/)).toBeInTheDocument();
    });
  });

  // Simulate the PullToRefresh pull gesture via mouse events.
  const pullToRefresh = (container: HTMLElement) => {
    const el = container.firstElementChild as HTMLElement;
    fireEvent.mouseDown(el, { clientY: 100 });
    fireEvent.mouseMove(el, { clientY: 250 }); // dist 150 -> damped ~67 >= threshold 64
    fireEvent.mouseUp(window);
  };

  it("prepends fresh articles and dedups overlapping ids on refresh", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce([makeArticle("new-1"), makeArticle("a-0"), ...makePage(1, 8)]);
    const initial = makePage(0, 10);
    const { container } = render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );

    pullToRefresh(container);

    await waitFor(() => {
      expect(screen.getByText("Article new-1")).toBeInTheDocument();
    });
    // a-0 already present -> deduped to a single instance
    expect(screen.getAllByText("Article a-0").length).toBe(1);
  });

  it("re-enables the More button after refresh fills a previously short feed", async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(makePage(0, 10));
    const initial = makePage(0, 3); // short feed -> no More button initially
    const { container } = render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );
    expect(screen.queryByText("More Articles")).not.toBeInTheDocument();

    pullToRefresh(container);

    await waitFor(() => {
      expect(screen.getByText("More Articles")).toBeInTheDocument();
    });
  });

  it("clears the load-more error banner after a successful refresh", async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom")) // load more fails
      .mockResolvedValueOnce(makePage(0, 10)); // refresh succeeds
    const initial = makePage(0, 10);
    const { container } = render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );

    fireEvent.click(screen.getByText("More Articles"));
    await waitFor(() => {
      expect(screen.getByText(/Couldn't load more articles/)).toBeInTheDocument();
    });

    pullToRefresh(container);

    await waitFor(
      () => {
        expect(screen.queryByText(/Couldn't load more articles/)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows the refresh error message when the fresh fetch fails", async () => {
    const fetchPage = vi.fn().mockRejectedValueOnce(new Error("boom"));
    const initial = makePage(0, 10);
    const { container } = render(
      <PaginatedNewsFeed initialArticles={initial} fetchPage={fetchPage} emptyMessage="Nothing here." />
    );

    pullToRefresh(container);

    // PullToRefresh keeps the "refreshing" phase for ~1.2s after the fetch
    // settles before showing the result message.
    await waitFor(
      () => {
        expect(screen.getByText(/Couldn't refresh\. Try again\./)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
