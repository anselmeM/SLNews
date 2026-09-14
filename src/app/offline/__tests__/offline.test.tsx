import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OfflinePage from "../page";
import type { NewsArticle } from "@/lib/news-service";
import { useAppStore } from "@/store/useAppStore";

describe("OfflinePage Component", () => {
  beforeEach(() => {
    useAppStore.setState({ savedArticles: [] });
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
  });

  it("renders offline status heading and guidance when offline", () => {
    render(<OfflinePage />);
    expect(screen.getByRole("heading", { name: /You're Offline/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Check Connection/i })).toBeInTheDocument();
  });

  it("renders data-saving tip when there are no saved articles", () => {
    render(<OfflinePage />);
    expect(screen.getByText(/Data-Saving Tip/i)).toBeInTheDocument();
  });

  it("renders list of saved articles when present in store", () => {
    const mockSavedArticle: NewsArticle = {
      id: "art-1",
      title: "Mining Sector Reforms in Kono",
      summary: "Summary of mining reforms.",
      content: "Content about mining.",
      imageUrl: "/images/mining.jpg",
      category: "Economy",
      source: "Concord Times",
      location: "Kono",
      publishedAt: new Date().toISOString(),
      authorId: "author-1",
    };

    useAppStore.setState({ savedArticles: [mockSavedArticle] });

    render(<OfflinePage />);

    expect(screen.getByText("Available Offline (1)")).toBeInTheDocument();
    expect(screen.getByText("Mining Sector Reforms in Kono")).toBeInTheDocument();
    expect(screen.getByText("• Kono")).toBeInTheDocument();
  });

  it("triggers window reload when retry button is clicked", async () => {
    const user = userEvent.setup();
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: reloadMock },
    });

    render(<OfflinePage />);

    await user.click(screen.getByRole("button", { name: /Check Connection/i }));
    expect(reloadMock).toHaveBeenCalled();
  });
});
