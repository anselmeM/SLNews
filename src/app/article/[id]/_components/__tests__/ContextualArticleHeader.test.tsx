import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContextualArticleHeader from "../ContextualArticleHeader";
import type { NewsArticle } from "@/lib/news-service";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

const mockArticle: NewsArticle = {
  id: "article-123",
  title: "Historic Cabinet Reshuffle Announced",
  summary: "Major updates to government ministries.",
  content: "Full content text here...",
  imageUrl: "/test.jpg",
  authorId: "author-1",
  category: "Politics",
  source: "Sierra Leone Telegraph",
  publishedAt: new Date().toISOString(),
};

describe("ContextualArticleHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders article title and category", () => {
    render(<ContextualArticleHeader article={mockArticle} />);
    expect(screen.getByText("Historic Cabinet Reshuffle Announced")).toBeInTheDocument();
    expect(screen.getByText("Politics")).toBeInTheDocument();
  });

  it("becomes visible on scroll past threshold", () => {
    const { container } = render(<ContextualArticleHeader article={mockArticle} />);
    const header = container.querySelector("aside");
    expect(header).toHaveClass("-translate-y-full");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 350, writable: true });
      fireEvent.scroll(window);
    });

    expect(header).toHaveClass("translate-y-0");
  });

  it("calls router back when back button clicked", () => {
    render(<ContextualArticleHeader article={mockArticle} />);
    const backBtn = screen.getByLabelText("Go back");
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });
});
