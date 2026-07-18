import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NewsFeed from "@/components/NewsFeed";
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

describe("NewsFeed", () => {
  it("renders empty state when no articles", () => {
    render(<NewsFeed articles={[]} emptyMessage="Nothing here." />);
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });

  it("renders featured article card when featured=true", () => {
    const articles = [makeArticle("1")];
    render(<NewsFeed articles={articles} />);
    expect(screen.getByText("Article 1")).toBeInTheDocument();
  });

  it("renders all articles without featured card when featured=false", () => {
    const articles = [makeArticle("1"), makeArticle("2")];
    render(<NewsFeed articles={articles} featured={false} />);
    expect(screen.getByText("Article 1")).toBeInTheDocument();
    expect(screen.getByText("Article 2")).toBeInTheDocument();
  });

  it("shows Load More button when label and handler provided", () => {
    const articles = [makeArticle("1")];
    const onLoadMore = vi.fn();
    render(
      <NewsFeed
        articles={articles}
        loadMoreLabel="Load More"
        onLoadMore={onLoadMore}
      />
    );
    expect(screen.getByText("Load More")).toBeInTheDocument();
  });

  it("does not show Load More button without handler", () => {
    const articles = [makeArticle("1")];
    render(<NewsFeed articles={articles} loadMoreLabel="Load More" />);
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  it("uses custom empty icon", () => {
    render(<NewsFeed articles={[]} emptyIcon="bookmark" />);
    expect(document.querySelector(".material-symbols-outlined")?.textContent).toBe("bookmark");
  });

  it("hides dividers when showDividers=false", () => {
    const articles = [makeArticle("1"), makeArticle("2")];
    render(<NewsFeed articles={articles} featured={false} showDividers={false} />);
    expect(document.querySelectorAll(".h-px").length).toBe(0);
  });
});