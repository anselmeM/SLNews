import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BookmarkButton from "@/components/BookmarkButton";
import { useBookmark } from "@/hooks/useBookmark";
import type { NewsArticle } from "@/lib/news-service";

vi.mock("@/hooks/useBookmark", () => ({
  useBookmark: vi.fn(() => ({
    isSaved: false,
    handleBookmark: vi.fn(),
  })),
}));

const mockArticle: NewsArticle = {
  id: "1",
  title: "Test Article",
  summary: "Summary",
  content: "Content",
  imageUrl: "/test.jpg",
  category: "News",
  source: "Test Source",
  publishedAt: new Date().toISOString(),
  authorId: "author-1",
};

describe("BookmarkButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bookmark_border icon when not saved", () => {
    render(<BookmarkButton article={mockArticle} />);
    const icon = document.querySelector(".material-symbols-outlined");
    expect(icon?.textContent).toBe("bookmark_border");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Bookmark article"
    );
  });

  it("renders bookmark (filled) icon when saved", () => {
    const mockUseBookmark = vi.mocked(useBookmark);
    mockUseBookmark.mockReturnValue({
      isSaved: true,
      handleBookmark: vi.fn(),
    });

    render(<BookmarkButton article={mockArticle} />);
    const icon = document.querySelector(".material-symbols-outlined");
    expect(icon?.textContent).toBe("bookmark");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Remove bookmark"
    );
  });

  it('uses "card" variant classes by default', () => {
    render(<BookmarkButton article={mockArticle} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bottom-3");
    expect(button.className).toContain("p-2.5");
  });

  it('uses "featured" variant classes when specified', () => {
    render(<BookmarkButton article={mockArticle} variant="featured" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("top-4");
    expect(button.className).toContain("backdrop-blur-md");
  });

  it("calls handleBookmark onClick", async () => {
    const handleBookmark = vi.fn();
    const mockUseBookmark = vi.mocked(useBookmark);
    mockUseBookmark.mockReturnValue({ isSaved: false, handleBookmark });

    render(<BookmarkButton article={mockArticle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handleBookmark).toHaveBeenCalledOnce();
  });
});
