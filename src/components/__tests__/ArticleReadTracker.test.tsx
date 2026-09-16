import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ArticleReadTracker from "@/components/ArticleReadTracker";
import { trackCustomMetaEvent } from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";

vi.mock("@/lib/meta-pixel", () => ({ trackCustomMetaEvent: vi.fn() }));

const article: NewsArticle = {
  id: "read-1",
  title: "Sierra Leone Headline",
  summary: "A summary",
  content: "Body copy for the article.",
  imageUrl: "/x.png",
  category: "National",
  source: "SLNews",
  publishedAt: new Date().toISOString(),
  authorId: "u1",
};

function makeScrollable(scrollHeight: number, innerHeight: number, scrollY: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: innerHeight });
  Object.defineProperty(window, "scrollY", { configurable: true, value: scrollY });
}

describe("ArticleReadTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    makeScrollable(0, 0, 0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires ArticleRead after 30 seconds of reading", () => {
    render(<ArticleReadTracker article={article} />);
    expect(trackCustomMetaEvent).not.toHaveBeenCalled();

    vi.advanceTimersByTime(30_000);

    expect(trackCustomMetaEvent).toHaveBeenCalledTimes(1);
    expect(trackCustomMetaEvent).toHaveBeenCalledWith(
      "ArticleRead",
      expect.objectContaining({ content_ids: ["read-1"] })
    );
  });

  it("fires once when the reader scrolls past 60%", () => {
    render(<ArticleReadTracker article={article} />);
    makeScrollable(2000, 1000, 700); // 70% of the scrollable area

    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));

    expect(trackCustomMetaEvent).toHaveBeenCalledTimes(1);
  });

  it("does not fire while the reader stays above the threshold", () => {
    render(<ArticleReadTracker article={article} />);
    makeScrollable(2000, 1000, 400); // 40%

    window.dispatchEvent(new Event("scroll"));

    expect(trackCustomMetaEvent).not.toHaveBeenCalled();
  });
});
