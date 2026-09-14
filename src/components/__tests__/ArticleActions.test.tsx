import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ArticleActions from "@/components/ArticleActions";
import { useBookmark } from "@/hooks/useBookmark";
import * as metaPixel from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";

vi.mock("@/hooks/useBookmark", () => ({
  useBookmark: vi.fn(() => ({
    isSaved: false,
    handleBookmark: vi.fn(),
  })),
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockArticle: NewsArticle = {
  id: "test-article-123",
  title: "Sierra Leone Economic Summit 2027",
  summary: "Key updates on currency stabilization and investment.",
  content: "Full content covering the summit proceedings in Freetown.",
  imageUrl: "/images/summit.jpg",
  category: "Economy",
  source: "Awoko",
  publishedAt: new Date().toISOString(),
  location: "Freetown",
  authorId: "author-1",
};

describe("ArticleActions Component", () => {
  const mockHandleBookmark = vi.fn();
  let trackMetaEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    trackMetaEventSpy = vi.spyOn(metaPixel, "trackMetaEvent").mockImplementation(() => {});
    vi.mocked(useBookmark).mockReturnValue({
      isSaved: false,
      handleBookmark: mockHandleBookmark,
    });
  });

  it("renders bookmark, WhatsApp, and system share buttons", () => {
    render(<ArticleActions article={mockArticle} />);

    expect(screen.getByRole("button", { name: /Bookmark article/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share on WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share article/i })).toBeInTheDocument();
  });

  it("triggers bookmark toggle when bookmark button is clicked", async () => {
    const user = userEvent.setup();
    render(<ArticleActions article={mockArticle} />);

    await user.click(screen.getByRole("button", { name: /Bookmark article/i }));
    expect(mockHandleBookmark).toHaveBeenCalledTimes(1);
  });

  it("opens WhatsApp share link and tracks Meta Share event", async () => {
    const user = userEvent.setup();
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ArticleActions article={mockArticle} />);

    await user.click(screen.getByRole("button", { name: /Share on WhatsApp/i }));

    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/?text="),
      "_blank",
      "noopener,noreferrer"
    );
    expect(trackMetaEventSpy).toHaveBeenCalledWith("Share", {
      content_type: "article",
      method: "whatsapp",
      content_name: mockArticle.title,
      content_ids: [mockArticle.id],
    });
  });

  it("tracks Meta Share event when system share is triggered", async () => {
    const user = userEvent.setup();
    Object.assign(navigator, {
      share: vi.fn().mockResolvedValue(undefined),
    });

    render(<ArticleActions article={mockArticle} />);

    await user.click(screen.getByRole("button", { name: /Share article/i }));

    expect(trackMetaEventSpy).toHaveBeenCalledWith("Share", {
      content_type: "article",
      method: "system",
      content_name: mockArticle.title,
      content_ids: [mockArticle.id],
    });
  });
});
